import { until } from 'selenium-webdriver';
import Select from 'selenium-webdriver/lib/select.js';
import { getLocator, formatResult } from '../utils.js';

export const selectDropdownTool = {
  name: 'select_dropdown',
  description: 'Select an option from a dropdown/select element by value, visible text, or index',
  inputSchema: {
    type: 'object',
    properties: {
      by: {
        type: 'string',
        enum: ['id', 'css', 'xpath', 'name', 'tag', 'class'],
        description: 'Locator strategy to find the dropdown element'
      },
      value: {
        type: 'string',
        description: 'Value for the locator strategy'
      },
      selectBy: {
        type: 'string',
        enum: ['value', 'text', 'index'],
        description: 'How to select the option (value attribute, visible text, or numeric index)'
      },
      optionValue: {
        type: 'string',
        description: 'The value, text, or index (as string) of the option to select'
      },
      timeout: {
        type: 'number',
        description: 'Maximum time to wait for element in milliseconds',
        default: 10000
      }
    },
    required: ['by', 'value', 'selectBy', 'optionValue']
  }
};

export async function selectDropdown(driver, params) {
  const { by, value, selectBy, optionValue, timeout = 10000 } = params;
  
  const locator = getLocator(by, value);
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  
  const select = new Select(element);
  
  switch (selectBy) {
    case 'value':
      await select.selectByValue(optionValue);
      break;
    case 'text':
      await select.selectByVisibleText(optionValue);
      break;
    case 'index':
      await select.selectByIndex(parseInt(optionValue));
      break;
  }
  
  const selected = await select.getFirstSelectedOption();
  const selectedText = await selected.getText();
  
  return formatResult(true, `Selected option: ${selectedText}`, { 
    selectedText,
    selectBy,
    optionValue
  });
}

export const getSelectedOptionTool = {
  name: 'get_selected_option',
  description: 'Get the currently selected option from a dropdown',
  inputSchema: {
    type: 'object',
    properties: {
      by: {
        type: 'string',
        enum: ['id', 'css', 'xpath', 'name', 'tag', 'class']
      },
      value: {
        type: 'string'
      },
      timeout: {
        type: 'number',
        default: 10000
      }
    },
    required: ['by', 'value']
  }
};

export async function getSelectedOption(driver, params) {
  const { by, value, timeout = 10000 } = params;
  
  const locator = getLocator(by, value);
  const element = await driver.wait(until.elementLocated(locator), timeout);
  
  const select = new Select(element);
  const selected = await select.getFirstSelectedOption();
  const selectedText = await selected.getText();
  const selectedValue = await selected.getAttribute('value');
  
  return formatResult(true, `Currently selected: ${selectedText}`, {
    selectedText,
    selectedValue
  });
}
