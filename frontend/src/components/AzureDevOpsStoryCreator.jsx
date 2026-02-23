import { useState } from 'react';

const AzureDevOpsStoryCreator = ({ onStoryCreated }) => {
  // Form field states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [businessValue, setBusinessValue] = useState('Medium');
  const [tags, setTags] = useState('');
  const [areaPath, setAreaPath] = useState('P8AG_Emp_comms\\ENT\\Emp_comms\\UPS_ITC');
  const [workItemType, setWorkItemType] = useState('User Story');
  const [functionalRequirements, setFunctionalRequirements] = useState('');
  const [securityRequirements, setSecurityRequirements] = useState('');
  const [nonFunctionalRequirements, setNonFunctionalRequirements] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [assumptions, setAssumptions] = useState('');
  const [definitionOfDone, setDefinitionOfDone] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdItem, setCreatedItem] = useState(null); // holds structured created work item details

  // Business value options
  const businessValueOptions = ['High', 'Medium', 'Low'];
  
  // Work item type options
  const workItemTypes = ['User Story', 'Bug', 'Task', 'Feature'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    // Auto-generate acceptance criteria from AI if empty
    let acceptanceCriteriaRef = acceptanceCriteria;
    if (!acceptanceCriteria.trim() && title.trim()) {
      setIsGeneratingCriteria(true);
      try {
        const acResp = await fetch('http://localhost:8080/api/azure-devops/generate-acceptance-criteria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), description: description.trim(), workItemType }),
        });
        const acData = await acResp.json();
        if (acData.success && acData.acceptanceCriteria) {
          setAcceptanceCriteria(acData.acceptanceCriteria);
          // Use the generated value directly since setState is async
          acceptanceCriteriaRef = acData.acceptanceCriteria;
        }
      } catch (acErr) {
        console.warn('[AC-GEN] Could not auto-generate acceptance criteria:', acErr.message);
      } finally {
        setIsGeneratingCriteria(false);
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare the request payload matching Azure DevOps API format
      const payload = {
        type: workItemType,
        fields: {
          'System.Title': title.trim(),
          'System.Description': description.trim() ? `<div>${description.replace(/\n/g, '<br/>')}</div>` : '',
          'Microsoft.VSTS.Common.AcceptanceCriteria': (acceptanceCriteriaRef || acceptanceCriteria).trim() ? 
            `<div><pre>${acceptanceCriteriaRef || acceptanceCriteria}</pre></div>` : '',
          'System.Tags': tags.trim()
        }
      };

      // Add Area Path if specified
      if (areaPath && areaPath.trim()) {
        payload.fields['System.AreaPath'] = areaPath.trim();
      }

      // Add Priority field with numeric values (1=High, 2=Medium, 3=Low)
      if (businessValue) {
        const priorityMap = { 'High': 1, 'Medium': 2, 'Low': 3 };
        payload.fields['Microsoft.VSTS.Common.Priority'] = priorityMap[businessValue] || 2;
      }

      // Add optional fields to Description if provided
      let extendedDescription = description.trim();
      
      if (functionalRequirements.trim()) {
        extendedDescription += `\n\n<h3>Functional Requirements</h3>\n<div>${functionalRequirements.replace(/\n/g, '<br/>')}</div>`;
      }
      if (securityRequirements.trim()) {
        extendedDescription += `\n\n<h3>Security Requirements</h3>\n<div>${securityRequirements.replace(/\n/g, '<br/>')}</div>`;
      }
      if (nonFunctionalRequirements.trim()) {
        extendedDescription += `\n\n<h3>Non-Functional Requirements</h3>\n<div>${nonFunctionalRequirements.replace(/\n/g, '<br/>')}</div>`;
      }
      if (dependencies.trim()) {
        extendedDescription += `\n\n<h3>Dependencies</h3>\n<div>${dependencies.replace(/\n/g, '<br/>')}</div>`;
      }
      if (assumptions.trim()) {
        extendedDescription += `\n\n<h3>Assumptions</h3>\n<div>${assumptions.replace(/\n/g, '<br/>')}</div>`;
      }
      if (definitionOfDone.trim()) {
        extendedDescription += `\n\n<h3>Definition of Done</h3>\n<div>${definitionOfDone.replace(/\n/g, '<br/>')}</div>`;
      }
      
      if (extendedDescription) {
        payload.fields['System.Description'] = `<div>${extendedDescription}</div>`;
      }

      // Call the backend API
      const response = await fetch('http://localhost:8080/api/azure-devops/work-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.message || errorData.error || 'Failed to create work item';
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      
      // Validate that we actually got a work item with an ID
      const workItemId = data.workItem?.id || data.id;
      
      if (!workItemId || !Number.isInteger(workItemId) || workItemId <= 0) {
        console.error('Invalid work item response:', data);
        throw new Error('Work item was not created successfully. No valid ID returned from Azure DevOps.');
      }
      
      const workItemUrl = `https://dev.azure.com/UPSProd8/P8AG_Emp_comms/_workitems/edit/${workItemId}`;
      
      console.log('Work item created successfully with ID:', workItemId);
      
      setCreatedItem({
        id: workItemId,
        title: title.trim(),
        type: workItemType,
        url: workItemUrl,
        priority: businessValue,
        tags: tags.trim(),
        acceptanceCriteria: (acceptanceCriteriaRef || acceptanceCriteria).trim(),
        description: description.trim(),
      });
      setSuccessMessage(''); // clear any stale message
      setErrorMessage('');
      // Do NOT auto-reset — user can click "Create Another" to start fresh

    } catch (error) {
      console.error('Error creating work item:', error);
      setErrorMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAcceptanceCriteria('');
    setBusinessValue('Medium');
    setTags('');
    setAreaPath('P8AG_Emp_comms\\ENT\\Emp_comms\\UPS_ITC');
    setWorkItemType('User Story');
    setFunctionalRequirements('');
    setSecurityRequirements('');
    setNonFunctionalRequirements('');
    setDependencies('');
    setAssumptions('');
    setDefinitionOfDone('');
    setErrorMessage('');
    setSuccessMessage('');
    setCreatedItem(null);
  };

  const fillSampleData = () => {
    setTitle('ParcelPro Contact Us Page Implementation');
    setDescription(`Implement a user-friendly Contact Us page for ParcelPro that allows customers to submit inquiries and feedback. The page should include a contact form, company contact information, and a location map.`);
    setAcceptanceCriteria(`Given I am a ParcelPro customer
When I navigate to the Contact Us page
Then I should see a contact form with fields for name, email, subject, and message

Given I have filled out the contact form
When I click the Submit button
Then my inquiry should be sent to the customer support team
And I should see a confirmation message`);
    setBusinessValue('High');
    setTags('Frontend, Customer-Facing, Contact-Form');
    setAreaPath('P8AG_Emp_comms\\ENT\\Emp_comms\\UPS_ITC');
    setFunctionalRequirements(`1. Contact form with name, email, subject, and message fields
2. Form validation for all required fields
3. Email address validation
4. Submit button with success/error feedback
5. Display company contact information (phone, email, address)
6. Embedded location map (Google Maps or equivalent)`);
    setSecurityRequirements(`1. Implement CSRF protection on form submission
2. Sanitize all user inputs to prevent XSS attacks
3. Rate limiting to prevent spam submissions
4. HTTPS required for form submission`);
    setNonFunctionalRequirements(`1. Contact form should load within 2 seconds
2. Mobile responsive design (320px to 1920px)
3. WCAG 2.1 Level AA accessibility compliance
4. Support for all modern browsers (Chrome, Firefox, Safari, Edge)`);
    setDependencies(`1. Backend email service integration
2. Google Maps API key
3. SMTP server configuration
4. Existing authentication system for logged-in users`);
    setAssumptions(`1. Users will have a valid email address
2. Customer support team can receive and respond to inquiries
3. Email delivery is reliable
4. Google Maps is accessible in target regions`);
    setDefinitionOfDone(`1. Contact form is fully functional and tested
2. All validation rules are implemented and working
3. Email notifications are sent to customer support
4. UI is responsive on all device sizes
5. Accessibility audit passed
6. Code review completed
7. Unit tests written with >80% coverage
8. Integration tests passed
9. Security scan completed with no critical issues
10. Documentation updated`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">
            🎯 Azure DevOps Story Creator
          </h2>
          <button
            type="button"
            onClick={fillSampleData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            📝 Fill Sample Data
          </button>
        </div>
        
        <p className="text-white text-opacity-80 mb-6">
          Create well-structured User Stories, Bugs, or Tasks directly in your Azure DevOps project.
        </p>

        {/* Created Work Item Details Card */}
        {createdItem && (
          <div className="mb-6 rounded-xl border-2 border-green-400 overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-green-500 bg-opacity-30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{createdItem.type} Created Successfully!</h3>
                  <p className="text-green-200 text-sm">Work Item #{createdItem.id}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href={createdItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  🔗 Open in Azure DevOps
                </a>
                <button
                  type="button"
                  onClick={() => { resetForm(); }}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  ➕ Create Another
                </button>
              </div>
            </div>
            {/* Details */}
            <div className="bg-white bg-opacity-5 px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">
              <div>
                <p className="text-green-300 font-semibold mb-1">Title</p>
                <p className="font-medium">{createdItem.title}</p>
              </div>
              <div>
                <p className="text-green-300 font-semibold mb-1">Type &amp; Priority</p>
                <p>{createdItem.type} · <span className={`font-semibold ${
                  createdItem.priority === 'High' ? 'text-red-300' :
                  createdItem.priority === 'Medium' ? 'text-yellow-300' : 'text-green-300'
                }`}>{createdItem.priority}</span></p>
              </div>
              {createdItem.description && (
                <div className="md:col-span-2">
                  <p className="text-green-300 font-semibold mb-1">Description</p>
                  <p className="whitespace-pre-wrap text-white text-opacity-90">{createdItem.description}</p>
                </div>
              )}
              {createdItem.acceptanceCriteria && (
                <div className="md:col-span-2">
                  <p className="text-green-300 font-semibold mb-1">Acceptance Criteria</p>
                  <pre className="whitespace-pre-wrap font-mono text-xs bg-white bg-opacity-10 rounded-lg p-3 leading-relaxed">{createdItem.acceptanceCriteria}</pre>
                </div>
              )}
              {createdItem.tags && (
                <div>
                  <p className="text-green-300 font-semibold mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {createdItem.tags.split(/[,;]/).filter(Boolean).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-600 bg-opacity-50 rounded-full text-xs">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-green-300 font-semibold mb-1">Azure DevOps Link</p>
                <a href={createdItem.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline break-all text-xs">{createdItem.url}</a>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Success Message (fallback) */}
        {successMessage && !createdItem && (
          <div className="mb-6 p-6 bg-green-500 bg-opacity-20 border-2 border-green-500 rounded-lg text-white">
            <p>{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-white">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Work Item Type */}
          <div>
            <label className="block text-white mb-2 font-semibold">
              Work Item Type <span className="text-red-400">*</span>
            </label>
            <select
              value={workItemType}
              onChange={(e) => setWorkItemType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {workItemTypes.map((type) => (
                <option key={type} value={type} className="bg-gray-800">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-white mb-2 font-semibold">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, concise title (e.g., 'Implement Contact Us Page')"
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white mb-2 font-semibold">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the work item, including context and objectives..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Acceptance Criteria (Gherkin Format) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-semibold">
                Acceptance Criteria (Gherkin Format)
              </label>
              <span className="text-white text-opacity-60 text-xs italic">
                ✨ Auto-filled by AI when empty on submit
              </span>
            </div>
            {isGeneratingCriteria && (
              <div className="mb-2 px-3 py-2 bg-purple-500 bg-opacity-30 border border-purple-400 rounded-lg text-white text-sm flex items-center gap-2">
                <span className="animate-spin">⏳</span> Generating acceptance criteria with AI...
              </div>
            )}
            <textarea
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder={`Leave blank to auto-generate from Title & Description\n\nOr write manually:\nGiven [context]\nWhen [action]\nThen [expected result]`}
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
          </div>

          {/* Two-column layout for business value and tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Value */}
            <div>
              <label className="block text-white mb-2 font-semibold">
                Priority (Business Value)
              </label>
              <select
                value={businessValue}
                onChange={(e) => setBusinessValue(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {businessValueOptions.map((value) => (
                  <option key={value} value={value} className="bg-gray-800">
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-white mb-2 font-semibold">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., Frontend, High-Priority, Customer-Facing"
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-white text-opacity-60 text-xs mt-1">
                Separate tags with commas or semicolons
              </p>
            </div>
          </div>

          {/* Area Path */}
          <div>
            <label className="block text-white mb-2 font-semibold">
              Area Path * <span className="text-white text-opacity-60 text-sm font-normal">(Required - Check your project settings)</span>
            </label>
            <input
              type="text"
              value={areaPath}
              onChange={(e) => setAreaPath(e.target.value)}
              placeholder="e.g., P8AG_Emp_comms\ENT\Emp_comms\UPS_ITC"
              required
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-white text-opacity-60 text-xs mt-1">
              View available area paths at: <a href="https://dev.azure.com/UPSProd8/P8AG_Emp_comms/_settings/work-areas" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline">Project Settings → Areas</a>
            </p>
          </div>

          {/* Collapsible Advanced Fields */}
          <details className="bg-white bg-opacity-5 rounded-lg p-4">
            <summary className="text-white font-semibold cursor-pointer hover:text-purple-300 transition-colors">
              📋 Advanced Fields (Optional)
            </summary>
            
            <div className="mt-4 space-y-6">
              {/* Functional Requirements */}
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Functional Requirements
                </label>
                <textarea
                  value={functionalRequirements}
                  onChange={(e) => setFunctionalRequirements(e.target.value)}
                  placeholder="List specific functional requirements (e.g., form fields, buttons, validation rules)..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Security Requirements */}
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Security Requirements
                </label>
                <textarea
                  value={securityRequirements}
                  onChange={(e) => setSecurityRequirements(e.target.value)}
                  placeholder="List security considerations (e.g., input validation, CSRF protection, authentication)..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Non-Functional Requirements */}
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Non-Functional Requirements
                </label>
                <textarea
                  value={nonFunctionalRequirements}
                  onChange={(e) => setNonFunctionalRequirements(e.target.value)}
                  placeholder="List performance, scalability, accessibility requirements..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Dependencies */}
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Dependencies
                </label>
                <textarea
                  value={dependencies}
                  onChange={(e) => setDependencies(e.target.value)}
                  placeholder="List any dependencies on other work items, systems, or APIs..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Assumptions */}
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Assumptions
                </label>
                <textarea
                  value={assumptions}
                  onChange={(e) => setAssumptions(e.target.value)}
                  placeholder="List any assumptions made about users, systems, or requirements..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Definition of Done */}
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Definition of Done
                </label>
                <textarea
                  value={definitionOfDone}
                  onChange={(e) => setDefinitionOfDone(e.target.value)}
                  placeholder="List criteria that must be met for this work item to be considered complete..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </details>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isGeneratingCriteria}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingCriteria ? '✨ Generating Criteria...' : isSubmitting ? '⏳ Creating...' : `🚀 Create ${workItemType}`}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Reset
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg">
          <h3 className="text-white font-semibold mb-2">💡 Tips for Writing Great User Stories</h3>
          <ul className="text-white text-opacity-80 text-sm space-y-1 list-disc list-inside">
            <li>Keep titles clear and action-oriented</li>
            <li>Use Gherkin format (Given/When/Then) for Acceptance Criteria</li>
            <li>Break large stories into smaller, manageable tasks</li>
            <li>Include specific, measurable success criteria</li>
            <li>Consider accessibility, security, and performance requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AzureDevOpsStoryCreator;
