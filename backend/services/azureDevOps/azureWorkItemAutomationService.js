const AzureDevOpsMcpConnector = require('./azureDevOpsMcpConnector');

class AzureWorkItemAutomationService {
  constructor(options = {}) {
    this.connector = options.connector || new AzureDevOpsMcpConnector(options.connectorOptions || {});
    this.logger = options.logger || console;
    this.testStatusField = options.testStatusField || process.env.AZURE_DEVOPS_TEST_STATUS_FIELD || 'Custom.TestStatus';
  }

  isAzureBoardsWorkItemTestType(testType = '') {
    const normalized = String(testType || '').toLowerCase();
    return normalized === 'performance' ||
      normalized === 'azure-boards-work-item-management' ||
      normalized.includes('work item management') ||
      normalized.includes('azure boards');
  }

  getStatusFieldPatch(status) {
    if (!this.testStatusField) {
      return {};
    }
    return { [this.testStatusField]: status };
  }

  async ensureConfigured() {
    if (!this.connector.isConfigured()) {
      const error = new Error('Azure DevOps integration is not configured. Set AZURE_DEVOPS_ORG_URL, AZURE_DEVOPS_PROJECT, and AZURE_DEVOPS_PAT or AZURE_DEVOPS_OAUTH_TOKEN.');
      error.status = 400;
      throw error;
    }
  }

  normalizeWorkItemIds(ids = []) {
    return (Array.isArray(ids) ? ids : [ids])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  sanitizeRichText(text = '') {
    return String(text || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  toStepLines(text = '', maxSteps = 12) {
    if (!text) {
      return [];
    }

    const lines = this.sanitizeRichText(text)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-*•\d.\)\s]+/, '').trim())
      .filter((line) => line.length >= 8);

    return lines.slice(0, maxSteps);
  }

  async buildGenerationPrompt(payload = {}) {
    const {
      testType,
      prompt = '',
      relatedWorkItemIds = []
    } = payload;

    if (!this.isAzureBoardsWorkItemTestType(testType)) {
      return prompt;
    }

    let normalizedRelatedIds = this.normalizeWorkItemIds(relatedWorkItemIds);
    if (!normalizedRelatedIds.length) {
      const idMatch = String(prompt || '').match(/work\s*item\s*id\s*[:#-]?\s*(\d+)/i);
      if (idMatch && idMatch[1]) {
        normalizedRelatedIds = this.normalizeWorkItemIds([idMatch[1]]);
      }
    }
    if (!normalizedRelatedIds.length || !this.connector.isConfigured()) {
      return prompt;
    }

    try {
      const primaryWorkItemId = normalizedRelatedIds[0];
      const workItem = await this.connector.getWorkItemById(primaryWorkItemId);
      const fields = workItem?.fields || {};

      const title = fields['System.Title'] || '';
      const description = this.sanitizeRichText(fields['System.Description'] || '');
      const acceptanceCriteria = this.sanitizeRichText(fields['Microsoft.VSTS.Common.AcceptanceCriteria'] || '');

      const candidateSteps = this.toStepLines(acceptanceCriteria).length
        ? this.toStepLines(acceptanceCriteria)
        : this.toStepLines(description);

      const mappedSteps = candidateSteps.length
        ? candidateSteps.map((line, index) => `${index + 1}. ${line}`).join('\n')
        : `1. Review work item requirements and execute the primary user journey.\n2. Validate all required fields and controls are visible and actionable.\n3. Verify expected results from acceptance criteria and fail on any mismatch.`;

      return `Azure Boards Work Item Source\n- Project: ${this.connector.project}\n- Work Item ID: ${primaryWorkItemId}\n- Title: ${title}\n\nOriginal Request:\n${prompt}\n\nAcceptance Criteria:\n${acceptanceCriteria || description || 'Not provided in work item.'}\n\nGenerate a comprehensive functional Selenium testcase that maps acceptance criteria to explicit execution steps.\n\nSteps to Execute:\n${mappedSteps}`;
    } catch (error) {
      this.logger.warn('Azure Boards prompt enrichment skipped', {
        reason: error.message
      });
      return prompt;
    }
  }

  async listWorkItems(options = {}) {
    await this.ensureConfigured();
    return this.connector.getWorkItems(options);
  }

  async createWorkItem(payload = {}) {
    await this.ensureConfigured();
    const { type = 'Task', fields = {} } = payload;
    return this.connector.createWorkItem(type, fields);
  }

  async updateWorkItem(workItemId, fields = {}) {
    await this.ensureConfigured();
    return this.connector.updateWorkItem(workItemId, fields);
  }

  async addWorkItemComment(workItemId, text) {
    await this.ensureConfigured();
    return this.connector.addComment(workItemId, text);
  }

  async linkWorkItems(sourceId, targetId, linkType, comment = '') {
    await this.ensureConfigured();
    return this.connector.linkWorkItems(sourceId, targetId, linkType, comment);
  }

  async syncGeneratedTest(payload = {}) {
    const {
      testType,
      prompt,
      testClassName,
      testFilePath,
      relatedWorkItemIds = [],
      assignedTo,
      priority,
      state = 'Active',
      workItemType = 'Task'
    } = payload;

    if (!this.isAzureBoardsWorkItemTestType(testType)) {
      return { enabled: false, reason: 'Test type is not Azure Boards work-item mode' };
    }

    await this.ensureConfigured();

    const normalizedRelatedIds = this.normalizeWorkItemIds(relatedWorkItemIds);
    const createdWorkItem = await this.connector.createWorkItem(workItemType, {
      'System.Title': `[AI Test] ${testClassName || 'Generated Test Case'}`,
      'System.Description': `Generated from AI prompt:\n${prompt || ''}\n\nTest class: ${testClassName || ''}\nPath: ${testFilePath || ''}`,
      'System.State': state,
      'System.Priority': priority,
      'System.AssignedTo': assignedTo,
      ...this.getStatusFieldPatch('Generated')
    });

    for (const workItemId of normalizedRelatedIds) {
      try {
        await this.connector.updateWorkItem(workItemId, {
          'System.State': state,
          'System.AssignedTo': assignedTo,
          'System.Priority': priority,
          ...this.getStatusFieldPatch('Linked')
        });
        await this.connector.linkWorkItems(
          createdWorkItem.id,
          workItemId,
          'System.LinkTypes.Related',
          `Linked to generated test ${testClassName || ''}`
        );
      } catch (error) {
        this.logger.error('Failed linking related work item', {
          workItemId,
          error: error.message
        });
      }
    }

    return {
      enabled: true,
      testCaseWorkItemId: createdWorkItem.id,
      linkedWorkItemIds: normalizedRelatedIds,
      project: this.connector.project,
      organizationUrl: this.connector.organizationUrl
    };
  }

  async postExecutionResult(execution = {}) {
    const {
      context,
      testRunId,
      testClassName,
      status,
      duration,
      errorMessage
    } = execution;

    if (!context || !context.enabled) {
      return null;
    }

    await this.ensureConfigured();

    const durationSeconds = typeof duration === 'number' ? (duration / 1000).toFixed(2) : 'N/A';
    const resultText = [
      `Automated test execution completed for ${testClassName || 'Unknown Test'}.`,
      `Run ID: ${testRunId || 'N/A'}`,
      `Status: ${(status || 'unknown').toUpperCase()}`,
      `Duration: ${durationSeconds}s`,
      errorMessage ? `Error: ${errorMessage}` : ''
    ].filter(Boolean).join('\n');

    const allWorkItemIds = this.normalizeWorkItemIds([
      context.testCaseWorkItemId,
      ...(context.linkedWorkItemIds || [])
    ]);

    const testStatus = status === 'passed' ? 'Passed' : status === 'failed' ? 'Failed' : 'Executed';

    for (const workItemId of allWorkItemIds) {
      try {
        await this.connector.addComment(workItemId, resultText);
        await this.connector.updateWorkItem(workItemId, {
          ...this.getStatusFieldPatch(testStatus)
        });
      } catch (error) {
        this.logger.error('Failed posting execution result to work item', {
          workItemId,
          error: error.message
        });
      }
    }

    return {
      updatedWorkItemIds: allWorkItemIds,
      testStatus
    };
  }

  /**
   * Generate CSV test case file from Azure DevOps work item
   * @param {Object} payload - Request payload
   * @returns {Object} - CSV generation result
   */
  async generateCSVTestCase(payload = {}) {
    const {
      prompt = '',
      relatedWorkItemIds = []
    } = payload;

    await this.ensureConfigured();

    // Determine work item ID from payload or prompt
    let normalizedRelatedIds = this.normalizeWorkItemIds(relatedWorkItemIds);
    if (!normalizedRelatedIds.length) {
      const idMatch = String(prompt || '').match(/work\s*item\s*id\s*[:#-]?\s*(\d+)/i);
      if (idMatch && idMatch[1]) {
        normalizedRelatedIds = this.normalizeWorkItemIds([idMatch[1]]);
      }
    }

    if (!normalizedRelatedIds.length) {
      throw new Error('No work item ID provided. Include work item ID in prompt or relatedWorkItemIds.');
    }

    const primaryWorkItemId = normalizedRelatedIds[0];
    
    // Fetch work item from Azure DevOps
    const workItem = await this.connector.getWorkItemById(primaryWorkItemId);
    
    // Use CSV writer to parse and generate file
    const csvWriter = require('../csvTestCaseWriter');
    const workItemData = csvWriter.parseWorkItemToTestSteps(workItem);
    const result = csvWriter.generateTestCaseCSV(workItemData);

    return {
      success: true,
      csvFilePath: result.filePath,
      csvFileName: result.filename,
      testStepCount: result.testStepCount,
      workItemId: primaryWorkItemId,
      workItemTitle: workItemData.title
    };
  }
}

module.exports = new AzureWorkItemAutomationService();
module.exports.AzureWorkItemAutomationService = AzureWorkItemAutomationService;
