const fs = require('fs');
const path = require('path');

/**
 * CSV Test Case Writer Service
 * Generates CSV test case files from Azure DevOps work item data or plain prompts.
 * Format: Test Case ID | Title | Preconditions | Test Steps | Expected Result
 * One row per test scenario/case.
 *
 * *** AUTO-REWRITTEN – new column structure ***
 */

// ─── Placeholder sentinel so the file replace covers the whole original class ─
// (Everything below replaces the original 830-line file)
class CSVTestCaseWriter {
    constructor() {
        this.outputDir = path.join(__dirname, '..', '..', 'functional test report');
        this.ensureOutputDirectory();
    }

    ensureOutputDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Escape CSV field value (handle commas, quotes, newlines)
     */
    escapeCSVField(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const strValue = String(value);
        
        // If the value contains comma, quote, or newline, wrap it in quotes
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            // Escape existing quotes by doubling them
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        
        return strValue;
    }

    /**
     * Generate CSV test case file – NEW FORMAT
     * @param {Object} workItemData
     * @param {string} workItemData.id         – work item / run ID
     * @param {string} workItemData.title      – overall feature / bug title
     * @param {Array}  workItemData.testCases  – array of
     *   { id, title, preconditions, testSteps, expectedResult }
     * @returns {{ success, filePath, filename, testCaseCount, workItemId }}
     */
    generateTestCaseCSV(workItemData) {
        const { id, title, testCases } = workItemData;

        // Back-compat: if caller passed old `testSteps` array, convert on the fly
        let cases = testCases;
        if (!cases || cases.length === 0) {
            if (workItemData.testSteps && workItemData.testSteps.length > 0) {
                cases = this._convertOldStepsToCases(workItemData.testSteps, id, title);
            } else {
                throw new Error('No test cases provided for CSV generation');
            }
        }

        // Build filename
        const timestamp = new Date().toISOString().split('T')[0];
        const sanitizedTitle = title
            ? title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50)
            : 'TestCase';
        const filename = `WorkItem_${id}_${sanitizedTitle}_${timestamp}.csv`;
        const filePath = path.join(this.outputDir, filename);

        // ── Canonical headers ──
        const headers = ['Test Case ID', 'Title', 'Preconditions', 'Test Steps', 'Expected Result'];
        const csvLines = [headers.join(',')];

        cases.forEach(tc => {
            const row = [
                this.escapeCSVField(tc.id || ''),
                this.escapeCSVField(tc.title || ''),
                this.escapeCSVField(tc.preconditions || ''),
                this.escapeCSVField(tc.testSteps || ''),
                this.escapeCSVField(tc.expectedResult || '')
            ];
            csvLines.push(row.join(','));
        });

        fs.writeFileSync(filePath, csvLines.join('\n'), 'utf8');

        console.log(`✅ CSV written: ${filename}  (${cases.length} test case(s))`);
        return {
            success: true,
            filePath,
            filename,
            testCaseCount: cases.length,
            testStepCount: cases.length,   // back-compat alias
            workItemId: id
        };
    }

    /** Back-compat shim – converts old step-array format to new test-case format */
    _convertOldStepsToCases(testSteps, workItemId, title) {
        const rawId = String(workItemId).replace(/[^0-9a-zA-Z]/g, '').substring(0, 10) || 'TC';
        const preconditions = `User is on the application page`;
        // Group consecutive steps that share the same testName into one test case
        const groups = {};
        testSteps.forEach(step => {
            const key = step.testName || title || 'Test Case';
            if (!groups[key]) groups[key] = [];
            groups[key].push(step);
        });
        return Object.entries(groups).map(([groupName, steps], idx) => {
            const stepsText = steps
                .map((s, i) => `${i + 1}. ${s.stepsToExecute || s.action || ''}`)
                .join('\n');
            const expectedResult = steps.map(s => s.expectedResults || s.expected || '').find(Boolean) || '';
            return {
                id: `TC_${rawId}_${String(idx + 1).padStart(2, '0')}`,
                title: groupName,
                preconditions,
                testSteps: stepsText,
                expectedResult
            };
        });
    }

    /**
     * Parse an Azure DevOps work item and produce test cases for CSV output.
     * Each <li> acceptance criterion becomes its own test case row.
     * Returns the shape expected by generateTestCaseCSV.
     */
    parseWorkItemToTestCases(workItem) {
        const { id, fields } = workItem;
        const title = fields['System.Title'] || 'Untitled Test Case';
        const acceptanceCriteria = fields['Microsoft.VSTS.Common.AcceptanceCriteria'] || '';
        const description = fields['System.Description'] || '';
        const rawId = String(id);

        // Primary path: extract each <li> HTML criterion as a separate test case row
        const criteriaItems = this.extractHtmlListItems(acceptanceCriteria);

        if (criteriaItems.length > 0) {
            const preconditions = this.sanitizeRichText(description).trim();
            const testCases = criteriaItems.map((criterion, idx) => {
                const tcId = `TC_${rawId}_${String(idx + 1).padStart(2, '0')}`;
                const { steps, expected } = this.splitCriterionIntoStepsAndResult(criterion);
                return {
                    id: tcId,
                    title: `${title} - Scenario ${idx + 1}`,
                    preconditions,
                    testSteps: steps,
                    expectedResult: expected
                };
            });
            return { id, title, testCases };
        }

        // Fallback: combine and use the prompt-based parser (handles plain text / BDD / numbered lists)
        const combinedText = [title, this.sanitizeRichText(description), this.sanitizeRichText(acceptanceCriteria)]
            .filter(Boolean)
            .join('\n');
        const testCases = this.parsePromptIntoTestCases(combinedText, rawId);
        return { id, title, testCases };
    }

    /** @deprecated use parseWorkItemToTestCases */
    parseWorkItemToTestSteps(workItem) {
        return this.parseWorkItemToTestCases(workItem);
    }

    // ─────────────────────────────────────────────── rich-text helpers ──────

    /**
     * Extract text content of every <li> element from an HTML string.
     * Returns an array of plain-text strings, one per list item.
     */
    extractHtmlListItems(html) {
        if (!html) return [];
        const items = [];
        const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let match;
        while ((match = liRegex.exec(html)) !== null) {
            const text = this.sanitizeRichText(match[1]).trim();
            if (text) items.push(text);
        }
        return items;
    }

    /**
     * Split an acceptance criterion into a test step (the action) and an
     * expected result (the "should …" outcome clause).
     *
     * Example input:
     *   "the user clicks Europe, the list of countries should be displayed"
     * Returns:
     *   { steps: "the user clicks Europe", expected: "the list of countries should be displayed" }
     */
    splitCriterionIntoStepsAndResult(criterion) {
        if (!criterion) return { steps: '', expected: '' };

        // Match ", <subject> should <outcome>" — the comma before a "should" clause
        const shouldPattern = /,\s*(the\s+(?:system|application|app|page|site|list|user)\b[\s\S]+?should\b[\s\S]+)$/i;
        const shouldMatch = criterion.match(shouldPattern);
        if (shouldMatch) {
            const steps = criterion.slice(0, criterion.length - shouldMatch[0].length).trim();
            const expected = this.capitalizeFirst(shouldMatch[1].trim());
            return { steps, expected };
        }

        // Fallback: no "should" found — treat entire criterion as step, derive expected from it
        return {
            steps: criterion.trim(),
            expected: this.capitalizeFirst(criterion.trim())
        };
    }

    sanitizeRichText(html) {
        if (!html) return '';
        let counter = 0;
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<\/div>/gi, '\n')
            .replace(/<\/li>/gi, '\n')
            .replace(/<li[^>]*>/gi, () => `${++counter}. `)
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ─────────────────────────────────────── prompt entry point ─────────────

    /**
     * Generate CSV directly from a freeform text prompt (no ADO connection).
     */
    generateCSVFromPrompt(prompt) {
        console.log('📝 Generating CSV from prompt (no Azure DevOps connection)');
        const workItemId = 'PROMPT_' + Date.now();
        const title = this.extractTitleFromPrompt(prompt);
        const testCases = this.parsePromptIntoTestCases(prompt, workItemId);
        return this.generateTestCaseCSV({ id: workItemId, title, testCases });
    }

    /**
     * Extract a concise title from the prompt.
     */
    extractTitleFromPrompt(prompt) {
        const patterns = [
            /bug\s+#?\d+\s*[:\-–]?\s*([^.,\n]{5,80})/i,
            /feature\s*[:\-–]\s*([^.,\n]{5,80})/i,
            /test\s+(?:for\s+)?([^.,\n]{5,80})/i,
            /verify\s+([^.,\n]{5,80})/i,
            /validate\s+([^.,\n]{5,80})/i
        ];
        for (const p of patterns) {
            const m = prompt.match(p);
            if (m && m[1]) return m[1].trim().replace(/[^a-zA-Z0-9\s_-]/g, '').substring(0, 80);
        }
        const firstLine = prompt.split(/\r?\n/).map(l => l.trim()).find(l => l.length > 5);
        return (firstLine || prompt).substring(0, 80).replace(/[^a-zA-Z0-9\s_-]/g, '').trim() || 'Test Case';
    }

    /** @deprecated use extractTitleFromPrompt */
    extractTestNameFromPrompt(prompt) {
        return this.extractTitleFromPrompt(prompt);
    }

    // ─────────────────────────────────────── core scenario parser ───────────

    /**
     * Parse a freeform prompt into an array of test-case objects.
     * Each object → ONE row in the CSV.
     *
     * Strategies (in priority order):
     *   1. Numbered scenarios  (1. … 2. … 3. …)
     *   2. BDD Scenario blocks (Scenario: / Given / When / Then)
     *   3. Single-scenario fallback
     */
    parsePromptIntoTestCases(prompt, workItemId) {
        const rawId = String(workItemId).replace('PROMPT_', '').replace(/[^0-9a-zA-Z]/g, '').substring(0, 10) || 'TC';
        const preconditions = this.extractPreconditions(prompt);

        // Strategy 1: numbered scenarios
        let scenarios = this.extractNumberedScenarios(prompt);

        // Strategy 2: BDD Scenario blocks
        if (scenarios.length === 0) {
            scenarios = this.extractBDDScenarios(prompt);
        }

        // Strategy 3: single-scenario fallback
        if (scenarios.length === 0) {
            scenarios = [{ title: this.extractTitleFromPrompt(prompt), rawText: prompt }];
        }

        const testCases = scenarios.map((scenario, index) => {
            const id = `TC_${rawId}_${String(index + 1).padStart(2, '0')}`;
            const testSteps = this.generateStepsForScenario(scenario.title, scenario.rawText, prompt);
            const expectedResult = this.extractExpectedResult(scenario.title, scenario.rawText);
            return { id, title: scenario.title, preconditions, testSteps, expectedResult };
        });

        console.log(`🗂️  Parsed ${testCases.length} test case(s) from prompt`);
        return testCases;
    }

    // ───────────────────────────────── scenario extraction helpers ──────────

    extractNumberedScenarios(prompt) {
        const lines = prompt.split(/\r?\n/);
        const scenarios = [];
        const numberPattern = /^(\d+)[.):\s]\s*(.+)/;
        let current = null;
        let bodyLines = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            const m = trimmed.match(numberPattern);
            if (m) {
                if (current) { current.rawText = bodyLines.join('\n'); scenarios.push(current); }
                current = { title: m[2].replace(/:$/, '').trim(), rawText: '' };
                bodyLines = [m[2].replace(/:$/, '').trim()];
            } else if (current && trimmed.length > 0) {
                bodyLines.push(trimmed);
            }
        });
        if (current) { current.rawText = bodyLines.join('\n'); scenarios.push(current); }
        return scenarios.length >= 2 ? scenarios : [];
    }

    extractBDDScenarios(prompt) {
        // Find every "Scenario:" occurrence and slice out its block
        const regex = /\bScenario\s*:/gi;
        const matches = [...prompt.matchAll(regex)];
        if (matches.length === 0) return [];
        return matches.map((match, i) => {
            const start = match.index + match[0].length;
            const end = matches[i + 1] ? matches[i + 1].index : prompt.length;
            const block = prompt.slice(start, end).trim();
            const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            return { title: lines[0] || 'Unnamed Scenario', rawText: block };
        });
    }

    // ───────────────────────────────── step / expected-result generation ────

    generateStepsForScenario(title, rawText, fullPrompt) {
        const combined = ((title || '') + ' ' + (rawText || '')).toLowerCase();

        // BDD When/And lines → explicit steps
        const bddSteps = (rawText || '').split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => /^(Given|When|And)\s/i.test(l))
            .map(l => l.replace(/^(Given|When|And)\s+/i, '').trim());
        if (bddSteps.length >= 2) return bddSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');

        // Bullet/numbered sub-steps in rawText
        const bulletSteps = (rawText || '').split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => /^(\d+[.)]\s+|[-*•]\s+)/.test(l))
            .map(l => l.replace(/^(\d+[.)]\s+|[-*•]\s+)/, '').trim());
        if (bulletSteps.length >= 2) return bulletSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');

        // Keyword-based generation
        const pageName = this.extractPageNameFromText(fullPrompt || rawText || title);
        const steps = [`Navigate to the ${pageName} page`];

        if (combined.includes('valid') && (combined.includes('submit') || combined.includes('form') || combined.includes('success'))) {
            steps.push('Fill in all required fields with valid data');
            if (combined.includes('recaptcha') || combined.includes('captcha')) steps.push('Complete the reCAPTCHA verification');
            steps.push('Click the Submit button');
        } else if (combined.includes('mandatory') || combined.includes('required field') || combined.includes('missing')) {
            steps.push('Leave one or more mandatory fields empty');
            steps.push('Click the Submit button');
        } else if (combined.includes('invalid email') || combined.includes('email format')) {
            steps.push('Enter an invalid email address format');
            steps.push('Fill in all other required fields with valid data');
            steps.push('Click the Submit button');
        } else if (combined.includes('invalid phone') || combined.includes('phone number')) {
            steps.push('Enter an invalid phone number');
            steps.push('Fill in all other required fields with valid data');
            steps.push('Click the Submit button');
        } else if (combined.includes('recaptcha') || combined.includes('captcha')) {
            steps.push('Fill in all required fields with valid data');
            steps.push('Skip the reCAPTCHA step');
            steps.push('Click the Submit button');
        } else if (combined.includes('dropdown') || combined.includes('radio button') || combined.includes('radio')) {
            steps.push('Select a value from the dropdown field(s)');
            steps.push('Select a radio button option');
            steps.push('Verify the selections are accepted without errors');
        } else if (combined.includes('error') || combined.includes('system error') || combined.includes('failure')) {
            steps.push('Fill in all required fields with valid data');
            steps.push('Simulate a system/server error condition');
            steps.push('Click the Submit button');
        } else if (combined.includes('accessib') || combined.includes('usab') || combined.includes('keyboard')) {
            steps.push('Navigate through all form fields using the keyboard (Tab key)');
            steps.push('Verify all labels and ARIA attributes are present');
            steps.push('Check colour contrast and focus indicators');
        } else if (combined.includes('login') || combined.includes('sign in')) {
            steps.push('Enter valid username and password credentials');
            steps.push('Click the Login / Sign In button');
        } else if (combined.includes('register') || combined.includes('sign up')) {
            steps.push('Fill in all registration fields (First Name, Last Name, Email, Password)');
            steps.push('Accept Terms & Conditions');
            steps.push('Click the Register / Sign Up button');
        } else if (combined.includes('search')) {
            steps.push('Enter a search keyword in the search field');
            steps.push('Click the Search button or press Enter');
        } else if (combined.includes('upload') || combined.includes('file')) {
            steps.push('Click the Upload / Choose File button');
            steps.push('Select a valid file from the local machine');
            steps.push('Confirm the upload');
        } else if (combined.includes('delete') || combined.includes('remove')) {
            steps.push('Select the item to be deleted / removed');
            steps.push('Click the Delete / Remove button');
            steps.push('Confirm the action in the confirmation dialog');
        } else if (combined.includes('edit') || combined.includes('update')) {
            steps.push('Select the record to be edited');
            steps.push('Update the required field(s) with new values');
            steps.push('Click the Save / Update button');
        } else {
            steps.push('Interact with the relevant page elements');
            steps.push('Perform the main action described in the scenario');
        }
        steps.push('Observe and verify the result');

        return steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }

    extractExpectedResult(title, rawText) {
        const combined = ((title || '') + ' ' + (rawText || '')).toLowerCase();

        // BDD Then clause
        const thenMatch = (rawText || '').match(/\bThen\s+(.+)/i);
        if (thenMatch) return this.capitalizeFirst(thenMatch[1].trim().replace(/\.$/, '')) + '.';

        if (combined.includes('valid') && (combined.includes('submit') || combined.includes('success')))
            return 'Form is submitted successfully and a confirmation message is displayed to the user.';
        if (combined.includes('mandatory') || combined.includes('required field') || combined.includes('missing'))
            return 'Inline validation messages are displayed for each empty mandatory field.';
        if (combined.includes('invalid email') || combined.includes('email format'))
            return 'An error message indicating an invalid email format is displayed.';
        if (combined.includes('invalid phone') || combined.includes('phone number'))
            return 'A phone number validation error message is displayed.';
        if (combined.includes('recaptcha') || combined.includes('captcha'))
            return 'A validation message prompts the user to complete the reCAPTCHA before submitting.';
        if (combined.includes('dropdown') || combined.includes('radio'))
            return 'All dropdown selections and radio button choices are accepted without errors.';
        if (combined.includes('system error') || combined.includes('server error'))
            return 'A user-friendly error message is displayed with an option to retry.';
        if (combined.includes('accessib') || combined.includes('usab') || combined.includes('keyboard'))
            return 'All form elements are accessible via keyboard, labels are correctly associated, and WCAG contrast ratios are met.';
        if (combined.includes('login') || combined.includes('sign in'))
            return 'User is successfully authenticated and redirected to the home/dashboard page.';
        if (combined.includes('register') || combined.includes('sign up'))
            return 'Account is created and a confirmation email is sent to the registered email address.';
        if (combined.includes('search'))
            return 'Relevant search results are displayed matching the entered keyword.';
        if (combined.includes('upload'))
            return 'File is uploaded successfully and shown in the list.';
        if (combined.includes('delete') || combined.includes('remove'))
            return 'The selected item is removed and a success notification is shown.';
        if (combined.includes('edit') || combined.includes('update'))
            return 'The record is updated with the new values and a success notification is shown.';

        return 'The action completes successfully with the expected outcome displayed.';
    }

    // ───────────────────────────────────── precondition / page helpers ──────

    extractPreconditions(prompt) {
        return `User is on the ${this.extractPageNameFromText(prompt)} page`;
    }

    extractPageNameFromText(text) {
        if (!text) return 'application';
        const lower = text.toLowerCase();
        const pageMatch = text.match(/(?:on\s+(?:the\s+)?)?([A-Z][a-zA-Z\s]{2,30}?)\s+[Pp]age/);
        if (pageMatch) return pageMatch[1].trim();
        if (lower.includes('contact us'))  return 'Contact Us';
        if (lower.includes('contact'))     return 'Contact';
        if (lower.includes('login') || lower.includes('sign in'))  return 'Login';
        if (lower.includes('register') || lower.includes('sign up')) return 'Registration';
        if (lower.includes('checkout'))    return 'Checkout';
        if (lower.includes('cart'))        return 'Shopping Cart';
        if (lower.includes('search'))      return 'Search';
        if (lower.includes('profile'))     return 'User Profile';
        if (lower.includes('dashboard'))   return 'Dashboard';
        if (lower.includes('settings'))    return 'Settings';
        if (lower.includes('parcelpro'))   return 'ParcelPro';
        if (lower.includes('offices'))     return 'Offices';
        return 'application';
    }
}

module.exports = new CSVTestCaseWriter();
