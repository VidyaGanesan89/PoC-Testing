package common;

import java.time.Duration;
import java.util.*;

import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
//import com.google.common.base.Strings;


/**
 *	Defines methods used to interact with web elements in the application.  These methods are preferred over directly invoking methods on WebDriver. 
 */
public abstract class ElementActionsBase {

	// ********************************************************************************
	// State Information
	// ********************************************************************************
	
	/**
	 * Tests if an element is displayed
	 * @param element	The element to test
	 * @return			Returns true if the element is displayed; otherwise false.
	 */
	public static boolean isDisplayed(WebElement element) {
		try {
			boolean isDisplayed = element.isDisplayed();
			return isDisplayed;			
		} catch (Exception e) {
			common.Reporter.logError("Check Element Displayed", "Error while checking if element '" + element.toString() + "' is displayed.  Error message = " + e.getMessage());
			throw(e);
			
		}
	}
	
	/**
	 * Tests if an element is enabled
	 * @param element	The element to test
	 * @return			Returns true if the element is enabled; otherwise false.
	 */
	public static boolean isEnabled(WebElement element) {
		try {
			boolean isEnabled = element.isEnabled();
			return isEnabled;			
		} catch (Exception e) {
			Reporter.logError("Check Element Enabled", "Error while checking if element '" + element.toString() + "' is enabled.  Error message = " + e.getMessage());
			throw(e);
		}
	}
	
	/**
	 * Tests if an element is selected (or checked)
	 * @param element	The element to test
	 * @return			Returns true if the element is selected; otherwise false
	 */
	public static boolean isSelected(WebElement element) {
		try {
			// to scroll until the element is visible
			DriverBase.ensureElementVisible(element);
			boolean isChecked = element.isSelected();
			return isChecked;			
		} catch (Exception e) {
			Reporter.logError("Check Element IsChecked", "Error while checking if element '" + element.toString() + "' is checked.  Error message = " + e.getMessage());
			throw(e);
		}
	}
	

	// ********************************************************************************
	// Generic Element Actions
	// ********************************************************************************
	
	/**
	 * Clicks on the specified element.
	 * @param elementName	The friendly name of the UI element for logging purposes.
	 * @param element		The element to click.
	 */
	public static void clickElement(String elementName, WebElement element) {
		String stepName = "Click '" + elementName + "'";
		System.out.println(stepName);
		try {
			//Driver.waitForElement(element);
			element.click();
			Reporter.logInfo(stepName, "Clicked element '" + elementName + "'.");
		} catch (Exception e) {
			Reporter.logError(stepName, "Unable to click element '" + elementName + "'.  Error message = ");
//			throw(e);
		}
	}

	/**
	 * Clicks on the specified element using a WebDriver action instead of the standard click method.
	 * @param elementName	The friendly name of the UI element for logging purposes.
	 * @param element		The element to click.
	 */
	public static void clickElementByAction(String elementName, WebElement element) {
		String stepName = "Click '" + elementName + "'";
		System.out.println(stepName);		
		try {
			
			Driver.waitForElement(element);

			Actions actions = new Actions(Driver.instance);
			actions.moveToElement(element);
			actions.click().perform();
			
			Reporter.logInfo(stepName, "Clicked element '" + elementName + "'.");
			
		} catch (Exception e) {
			Reporter.logError(stepName, "Unable to click element '" + elementName + "'.  Error message = " + e.getMessage());
			throw(e);
		}
	}

	/**
	 * Moves the mouse over the specified element, clicks, and maintains the position of the mouse over the element.
	 * @param elementName	The friendly name of the UI element for logging purposes.
	 * @param element		The element to click and hover over.
	 */
	public static void clickAndHover(String elementName, WebElement element) {
		String stepName = "Hover on '" + elementName + "'";
		System.out.println(stepName);
		try {
			Driver.waitForElement(element);

			Actions actions = new Actions(Driver.instance);
			actions.moveToElement(element).clickAndHold().perform();

			Reporter.logInfo(stepName, "Hovered on element '" + elementName + "'.");
		} catch (Exception e) {
			Reporter.logError(stepName, "Unable to hover on element '" + elementName + "'.  Error message = " + e.getMessage());
			throw(e);
		}
	}
	
	/**
	 * Enters text into the specified element. 
	 * @param elementName	The friendly name of the UI element for logging purposes.
	 * @param element		The element
	 * @param text			The text to be entered
	 */
	public static void enterText(String elementName, WebElement element, String text) {
		
		System.out.println(element.getTagName());
		
		if (element.getTagName().equals("select")) {
			selectFromComboBox(elementName, element, text);
		} else {	
			String stepName = "Set '" + elementName + "' = '" + text + "'";
			System.out.println(stepName);
			try {
				element.clear();
				element.sendKeys(text);
				Reporter.logInfo(stepName, "Text of '" + elementName + "' set to '" + text + "'.");
			} catch (Exception e) {
				Reporter.logError(stepName, "Error setting text of '" + elementName + "' to '" + text + "'.  Error message = " + e.getMessage());
				throw(e);
			}
		}
	}

	/**
	 * Enters text into the specified element.
	 * @param elementName	The friendly name of the UI element for logging purposes.
	 * @param element		The element
	 * @param text			The text to be entered
	 */
	public static void enterTextWithSubmit(String elementName, WebElement element, String text) {

		System.out.println(element.getTagName());

		if (element.getTagName().equals("select")) {
			selectFromComboBox(elementName, element, text);
		} else {
			String stepName = "Set '" + elementName + "' = '" + text + "'";
			System.out.println(stepName);
			try {
				element.clear();
				element.sendKeys(text);
				element.sendKeys(Keys.ENTER);
				Reporter.logInfo(stepName, "Text of '" + elementName + "' set to '" + text + "'.");
			} catch (Exception e) {
				Reporter.logError(stepName, "Error setting text of '" + elementName + "' to '" + text + "'.  Error message = " + e.getMessage());
//				throw(e);
			}
		}
	}

	/**
	 * Enters text into the specified element.
	 * @param elementName	The friendly name of the UI element for logging purposes.
	 * @param element		The element
	 */
	public static void clearText(String elementName, WebElement element) {

		String stepName = "clear '" + elementName + "'" ;
		System.out.println(stepName);
		try {

			element.clear();

			Reporter.logInfo(stepName, "Text of '" + elementName + "'" );

		} catch (Exception e) {
			Reporter.logError(stepName, "Error setting text of '" + elementName + "'.  Error message = " + e.getMessage());
			throw (e);
		}

	}


	/**
	 * Reads text from an element using the standard 'getText' method.
	 * @param elementName	The friendly name of the UI element for logging purposes.
	 * @param element		The element whose text should be read.
	 * @return				Returns the text of the element trimmed of all leading and trailing white space.
	 */
	public static String readText(String elementName, WebElement element) {
		String stepName = "Read From '" + elementName + "'";
		//System.out.println(stepName);
		try {
			Driver.waitForElement(element);

			if (element.getTagName().equals("select")) {
				return getSelectedComboBoxValue(elementName, element);
			} else {
				String text = element.getText().trim();
				if(text.isEmpty()) {
					//text = Strings.nullToEmpty(element.getAttribute("value")).trim();
					if(text.isEmpty()) {
						//text = Strings.nullToEmpty(element.getAttribute("innerText")).trim();
					}
				}
				Reporter.logInfo(stepName, "Text of element '" + elementName + "' = '" + text.replace("\\n", "<NewLine>") + "'.");
				return text;
			}
		} catch (Exception e) {
			Reporter.logError(stepName, "Error reading text from element '" + elementName + ".  Error message = " + e.getMessage());
			throw(e);
		}
	}
	
	/**
	 * Performs the defined action of keys on the browser instance.
	 * @param keyAction				The key action to perform.
	 * @param actionDescription		A friendly description of the action for logging purposes.
	 */
	public static void performKeyboardAction(Keys keyAction, String actionDescription) {	
		try {
			Actions actions = new Actions(Driver.instance);
			actions.sendKeys(keyAction).build().perform();
			Reporter.logInfo("Keyboard Action", "Keyboard action '" + actionDescription + "' performed.");
		} catch (Exception e) {
			Reporter.logError("Keyboard Action", "Error while performing Keyboard action '" + actionDescription + "'.  Error message = " + e.getMessage());
			throw(e);
		}
	}
	
	/**
	 * Checks that the text of an element matches the expected text.
	 * @param element
	 */
	public static void checkText(String elementName, WebElement element, String expectedText) {
		if (element == null)
			throw new IllegalArgumentException("You must provide an element.");
		
		String stepName = "Checking Text of '" + elementName + "' = '" + expectedText + "'";
		String actualText = element.getText().trim();
		if (actualText != null && actualText.equalsIgnoreCase(expectedText)) {
			Reporter.logInfo(stepName, "The text of '" + elementName + "' matches.  Actual = '" + actualText + "'; Expected = '" + expectedText + "'.");
		} else {
			Reporter.logFail(stepName, "The text of '" + elementName + "' does not match.  Actual = '" + actualText + "'; Expected = '" + expectedText + "'.");
		}
	}
	
	// ********************************************************************************
	// Combo Box Actions
	// ********************************************************************************	

	/**
	 * Reads the value from the selected option in the given combo box.
	 * @param elementName	The friendly name of the UI element for logging purposes.
	 * @param element		The combo box element whose selected option should be read.
	 * @return				Returns the value of the selected option element trimmed of all leading and trailing white space.
	 */
	private static String getSelectedComboBoxValue(String elementName, WebElement element) {
		String stepName = "Read Selected Value From '" + elementName + "'";
		System.out.println(stepName);
		try {
			Select select = new Select(element);
			WebElement option = select.getFirstSelectedOption();
			String value = "";
			if (option != null) {
				// NOTE: Prefer display text over the value associated with the option
				value = option.getText().trim();
				if (value.isEmpty())
					value = option.getAttribute("value");
			}
			Reporter.logInfo(stepName, "Read selected value from element '" + elementName + "' as '" + value.replace("\\n", "<NewLine>") + "'.");
			return value;
		} catch (Exception e) {
			Reporter.logError(stepName, "Error reading selected value from element '" + elementName + ".  Error message = " + e.getMessage());
			throw(e);
		}
	}
	
	/**
	 * Selects an item from a combo box.
	 * @param elementName	The friendly name of the UI element for logging purposes
	 * @param element		The combo box element
	 * @param textValue		The value to select
	 */
	public static void selectFromComboBox(String elementName, WebElement element, String textValue)
	{
        boolean finished = false;
        String stepName = "Set '" + elementName + "' = '" + textValue + "'";
		System.out.println(stepName);
		Driver.waitForElement(element);
		try {
			if(element.isDisplayed())
			{
				StringBuilder availableOptions = new StringBuilder("Available options (formatted as 'Display Text [Value]'): ");			
				List<WebElement> options = element.findElements(By.tagName("option"));
				for (WebElement option : options)
				{
					String text = option.getText().trim();
					String value = option.getAttribute("value").trim();
					
					availableOptions.append(text).append(" [").append(value).append("]; ");
					
					// NOTE: Check for the text of the option OR the value associated with the option
					if(textValue.equalsIgnoreCase(text)
							|| textValue.equalsIgnoreCase(value))
					{
						option.click();
						Reporter.logInfo(stepName, "Drop-down selection successfully set to '" + textValue + "'.");
                        finished = true;
                        break;
                    }
					
				}
                if (!finished) {// Selection not found
                    Reporter.logError(stepName, "Unable to select the value '" + textValue + "' because the option was not found.  " + availableOptions.toString());
                }

            } else {
				Reporter.logError(stepName, "Unable to select the value '" + textValue + "' because the combo box element was not displayed.");				
			}
			
		} catch(Exception e) {
			Reporter.logError(stepName, "Drop-down selection could not be set to '" + textValue + "'.  Error message = " + e.getMessage());
			throw(e);
		}
	}

	public static void selectFromComboBoxWithMatchingText(String elementName, WebElement element, String textValue,Integer index)  {
		String stepName = "Set '" + elementName + "' = '" + textValue + "'";
		System.out.println(stepName);
		Driver.waitForElement(element);
//		try {
		ElementActions.clickByJavaScript(elementName,element);
		new Actions(Driver.instance).moveToElement(element).build().perform();
		try {
			Thread.sleep(5000);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
 DriverBase.waitForElementToBePresent(By.xpath("//label[text()='Week End Date']/following-sibling::select/option"));

		new WebDriverWait(Driver.instance, Duration.ofSeconds(30)).until(new ExpectedCondition<Boolean>() {
			@Override
			public Boolean apply(WebDriver driver) {
				return Driver.instance.findElements(By.xpath("//label[text()='Week End Date']/following-sibling::select/option")).size()>=7;
			}
		});
		Select select = new Select(element);
				List<WebElement> list=select.getOptions();
				System.out.println("Available options (formatted as 'Display Text [Value]'): ");
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        List<String> availableFinalOptions=new ArrayList<String>();
		List<WebElement> availableFinalOptionEle=new ArrayList<WebElement>();
				for (WebElement option:list){
					String val=option.getText();
					System.out.println(val);
					if(val.contains("Final")) {
						availableFinalOptions.add(val);
						availableFinalOptionEle.add(option);
					}
				}
		common.Reporter.logInfo(stepName, "Final dropdown options are :: "+availableFinalOptions);
//				for (WebElement option:list){

//					if(text.contains("Final")) {
					for(int i=0;i<availableFinalOptionEle.size();i++){
						String text=availableFinalOptionEle.get(i).getText();
						if(text.contains(textValue) && (index==i)) {
							select.selectByVisibleText(text);
							Reporter.logInfo(stepName, "Drop-down selection successfully set to '" + text + "'.");
							break;
						}
//					}
//						}
					}


				}

				//				StringBuilder availableOptions = new StringBuilder("Available options (formatted as 'Display Text [Value]'): ");

				//				List<WebElement> options = element.findElements(By.tagName("option"));
//				for (WebElement option : options)
//				{
//					String text = option.getText().trim();
//					String value = option.getAttribute("value").trim();
//
//					availableOptions.append(text).append(" [").append(value).append("]; ");
//
//					// NOTE: Check for the text of the option OR the value associated with the option
//					if(text.contains(textValue)
//							|| text.toLowerCase().contains(textValue.toLowerCase(Locale.ROOT)))
//					{
//						option.click();
//						Reporter.logInfo(stepName, "Drop-down selection successfully set to '" + textValue + "'.");
//						return;
//					}
//
//				}

				// Selection not found
//				Reporter.logError(stepName, "Unable to select the value '" + textValue + "' because the option was not found.  " + availableOptions.toString());
//			} else {
//				Reporter.logError(stepName, "Unable to select the value '" + textValue + "' because the combo box element was not displayed.");
//			}

//		} catch(Exception e) {
//			Reporter.logError(stepName, "Drop-down selection could not be set to '" + textValue + "'.  Error message = " + e.getMessage());
//			e.printStackTrace();
//		}
//	}
	/**
	 * Checks the sort order of a combo box
	 * @param elementName	The friendly name of the element for logging purposes.	
	 * @param element		The combo box element
	 */
	public static void checkComboBoxSort(String elementName, WebElement element) {
		String defaultValue = null;
		checkComboBoxSort(elementName, element, defaultValue);
	}

	/**
	 * Checks the sort order of a combo box
	 * @param elementName	The friendly name of the element for logging purposes.	
	 * @param element		The combo box element
	 * @param defaultValue	The default value for a combo box that typically appears first in the list and should be ignored when checking sort order
	 */
	public static void checkComboBoxSort(String elementName, WebElement element, String defaultValue) {
		String stepName = "Checking Sort in '" + elementName + "'";
		try {

			// Read all the values in the combo box.  Ignore the default value, if provided.
			List<String> actualList = new ArrayList<>();									
			if(element.isDisplayed()) {
				List<WebElement> allOptions = element.findElements(By.tagName("option"));
				for (WebElement option : allOptions) {
					String text = option.getText().trim().toUpperCase();
					if(!text.equalsIgnoreCase(defaultValue)) {
						actualList.add(text);
					}
				}
			}

			// Build a new list with the same entries and sort them
			List<String> sortedList = new ArrayList<>(actualList);
			Collections.sort(sortedList);
			
			if(actualList.equals(sortedList)) {
				
				// All entries are identical
				Reporter.logPass(stepName, "Values are sorted in '" + elementName + "' combo box");
				
			} else {
				
				// Log the entries where the sort does not match expectations
				Reporter.logFail(stepName, "Values are not sorted in '" + elementName + "' combo box");
				for (int i = 0; i < actualList.size(); i++) {
					String expected = sortedList.get(i);
					String actual = actualList.get(i);
					if (!expected.equals(actual)) {
						Reporter.logFail(stepName, "Elements at position " + (i + 1) + " do not match.  Actual: '" + actual + "';  Expected: '" + expected + "'", false);
					}					
				}
				
			}
		} catch (Exception e) {
			Reporter.logError(stepName, "Error checking combo box sort.  " + e.getMessage(), e);
			throw(e);
		}
	}
	
	
	// ********************************************************************************
	// Methods that may be useful in the future, but are not currently used. 
	// ********************************************************************************
	
	//	/**
	//	 * Reads image from the given element.
	//	 * @param elementName The friendly name of the UI element for logging purposes.
	//	 * @param element     The element whose image should be read.
	//	 * @return            The image fetched using the src attribute of the given element.
	//	 * @throws Exception 
	//	 */
	//	public static BufferedImage readImage(String elementName, WebElement element) {
	//		String stepName = "Read Image From '" + elementName + "'";
	//		System.out.println(stepName);
	//		try {
	//			String imageUrl = element.getAttribute("src");
	//			if(imageUrl == null || imageUrl.trim().isEmpty()) {
	//				Reporter.logFail(stepName, "Error reading image URL from element '" + elementName + ". Element does not have an src attribute.");
	//			}
	//			Reporter.logInfo(stepName, "Read image URL from element '" + elementName + "' as '" + imageUrl.replace("\\n", "<NewLine>") + "'.");
	//			URL url = new URL(imageUrl);
	//			BufferedImage image = ImageIO.read(url);
	//			return image;
	//		} catch (Exception e) {
	//			Reporter.logError(stepName, "Error reading image from element '" + elementName + ".  Error message = " + e.getMessage());
	//			throw new RuntimeException(e);
	//		}
	//	}
	
	//This method will scroll in to the view of the element *added by Holy
	
	public static void scrollIntoView(String elementName, WebElement element) {
		String stepName = "scroll in to'" + elementName + "'";
		System.out.println(stepName);
		try {
			Driver.waitForElement(element);
			JavascriptExecutor je = (JavascriptExecutor) Driver.instance;
			je.executeScript("arguments[0].scrollIntoView(true);",element);	
			element.click();
			Reporter.logInfo(stepName, "scrolled into element '" + elementName + "'.");
		} catch (Exception e) {
			Reporter.logError(stepName, "Unable to scroll in to element '" + elementName + "'.  Error message = " + e.getMessage());
			throw(e);
		}
	}

	public static void refreshPage() {
		Driver.instance.navigate().refresh();
	}
	
    
	
}
