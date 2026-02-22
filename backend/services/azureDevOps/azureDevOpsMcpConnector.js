class AzureDevOpsMcpConnector {
  constructor(options = {}) {
    this.organizationUrl = options.organizationUrl || process.env.AZURE_DEVOPS_ORG_URL || 'https://dev.azure.com/UPSProd8';
    this.project = options.project || process.env.AZURE_DEVOPS_PROJECT || 'P8AG_Emp_comms';
    this.pat = options.pat || process.env.AZURE_DEVOPS_PAT || '';
    this.oauthToken = options.oauthToken || process.env.AZURE_DEVOPS_OAUTH_TOKEN || '';
    this.apiVersion = options.apiVersion || process.env.AZURE_DEVOPS_API_VERSION || '7.1';
    this.timeoutMs = Number(options.timeoutMs || process.env.AZURE_DEVOPS_TIMEOUT_MS || 15000);
    this.httpClient = options.httpClient || this.createDefaultHttpClient();
    this.logger = options.logger || console;
  }

  createDefaultHttpClient() {
    return {
      request: async ({ method, url, data, headers }) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
          const response = await fetch(url, {
            method,
            headers,
            body: data !== undefined ? JSON.stringify(data) : undefined,
            signal: controller.signal
          });

          let payload = null;
          const text = await response.text();
          if (text) {
            try {
              payload = JSON.parse(text);
            } catch (parseError) {
              payload = { message: text };
            }
          }

          if (!response.ok) {
            const error = new Error(payload?.message || response.statusText || 'Azure DevOps request failed');
            error.response = {
              status: response.status,
              statusText: response.statusText,
              data: payload
            };
            throw error;
          }

          return { data: payload };
        } finally {
          clearTimeout(timeout);
        }
      }
    };
  }

  isConfigured() {
    return Boolean(this.organizationUrl && this.project && (this.pat || this.oauthToken));
  }

  getAuthHeader() {
    if (this.oauthToken) {
      return { Authorization: `Bearer ${this.oauthToken}` };
    }

    if (this.pat) {
      const encoded = Buffer.from(`:${this.pat}`).toString('base64');
      return { Authorization: `Basic ${encoded}` };
    }

    throw new Error('Azure DevOps authentication is not configured. Set AZURE_DEVOPS_PAT or AZURE_DEVOPS_OAUTH_TOKEN.');
  }

  sanitizeError(error) {
    const status = error?.response?.status;
    const statusText = error?.response?.statusText;
    const message = error?.response?.data?.message || error?.message || 'Unknown Azure DevOps error';
    return {
      status,
      statusText,
      message,
      details: error?.response?.data || null
    };
  }

  async request(method, url, data, extraHeaders = {}) {
    try {
      const response = await this.httpClient.request({
        method,
        url,
        data,
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
          ...extraHeaders
        }
      });
      return response.data;
    } catch (error) {
      const sanitized = this.sanitizeError(error);
      this.logger.error('Azure DevOps request failed', {
        method,
        url,
        status: sanitized.status,
        statusText: sanitized.statusText,
        message: sanitized.message
      });
      const err = new Error(sanitized.message);
      err.status = sanitized.status || 500;
      err.details = sanitized.details;
      throw err;
    }
  }

  buildProjectUrl(path) {
    return `${this.organizationUrl}/${encodeURIComponent(this.project)}${path}`;
  }

  async queryWorkItemIdsByType(types = ['User Story', 'Bug', 'Task'], top = 20) {
    const normalizedTypes = types.filter(Boolean).map((t) => `'${String(t).replace(/'/g, "''")}'`).join(', ');
    const wiql = {
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project AND [System.WorkItemType] IN (${normalizedTypes}) ORDER BY [System.ChangedDate] DESC`
    };

    const wiqlResponse = await this.request(
      'POST',
      this.buildProjectUrl(`/_apis/wit/wiql?api-version=${this.apiVersion}`),
      wiql
    );

    const ids = (wiqlResponse.workItems || []).map((item) => item.id).filter(Boolean).slice(0, top);
    return ids;
  }

  async getWorkItems(options = {}) {
    const {
      types = ['User Story', 'Bug', 'Task'],
      top = 20,
      fields = [
        'System.Id',
        'System.Title',
        'System.State',
        'System.AssignedTo',
        'Microsoft.VSTS.Common.Priority',
        'System.WorkItemType',
        'System.ChangedDate'
      ]
    } = options;

    const ids = await this.queryWorkItemIdsByType(types, top);
    if (!ids.length) {
      return [];
    }

    const details = await this.request(
      'GET',
      this.buildProjectUrl(`/_apis/wit/workitems?ids=${ids.join(',')}&fields=${fields.join(',')}&api-version=${this.apiVersion}`)
    );

    return details.value || [];
  }

  async getWorkItemById(workItemId, fields = [
    'System.Id',
    'System.Title',
    'System.Description',
    'Microsoft.VSTS.Common.AcceptanceCriteria',
    'System.WorkItemType',
    'System.State',
    'System.AssignedTo',
    'Microsoft.VSTS.Common.Priority'
  ]) {
    if (!workItemId) {
      throw new Error('workItemId is required');
    }

    return this.request(
      'GET',
      this.buildProjectUrl(`/_apis/wit/workitems/${workItemId}?fields=${fields.join(',')}&api-version=${this.apiVersion}`)
    );
  }

  buildPatchDocument(fields = {}) {
    return Object.entries(fields)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => ({
        op: 'add',
        path: `/fields/${key}`,
        value
      }));
  }

  async createWorkItem(workItemType, fields) {
    const patch = this.buildPatchDocument(fields);
    return this.request(
      'POST',
      this.buildProjectUrl(`/_apis/wit/workitems/$${encodeURIComponent(workItemType)}?api-version=${this.apiVersion}`),
      patch,
      { 'Content-Type': 'application/json-patch+json' }
    );
  }

  async updateWorkItem(workItemId, fields) {
    const patch = this.buildPatchDocument(fields);
    return this.request(
      'PATCH',
      this.buildProjectUrl(`/_apis/wit/workitems/${workItemId}?api-version=${this.apiVersion}`),
      patch,
      { 'Content-Type': 'application/json-patch+json' }
    );
  }

  async linkWorkItems(sourceWorkItemId, targetWorkItemId, linkType = 'System.LinkTypes.Related', comment = '') {
    const patch = [
      {
        op: 'add',
        path: '/relations/-',
        value: {
          rel: linkType,
          url: `${this.organizationUrl}/_apis/wit/workItems/${targetWorkItemId}`,
          attributes: {
            comment
          }
        }
      }
    ];

    return this.request(
      'PATCH',
      this.buildProjectUrl(`/_apis/wit/workitems/${sourceWorkItemId}?api-version=${this.apiVersion}`),
      patch,
      { 'Content-Type': 'application/json-patch+json' }
    );
  }

  async addComment(workItemId, text) {
    return this.request(
      'POST',
      this.buildProjectUrl(`/_apis/wit/workItems/${workItemId}/comments?api-version=7.1-preview.3`),
      { text }
    );
  }
}

module.exports = AzureDevOpsMcpConnector;
