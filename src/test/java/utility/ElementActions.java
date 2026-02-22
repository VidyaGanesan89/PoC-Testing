package utility;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

/**
 * ElementActions utility class for common Selenium actions with logging.
 */
public class ElementActions {

    /**
     * Click an element with logging.
     *
     * @param description Description of the action
     * @param element     The WebElement to click
     */
    public static void clickElement(String description, WebElement element) {
        try {
            System.out.println("Action: " + description);
            element.click();
            System.out.println("Successfully clicked: " + description);
        } catch (Exception e) {
            throw new RuntimeException("Failed to click element: " + description + " - " + e.getMessage(), e);
        }
    }

    /**
     * Send keys to an element with logging.
     *
     * @param description Description of the action
     * @param element     The WebElement to send keys to
     * @param text        The text to send
     */
    public static void sendKeys(String description, WebElement element, String text) {
        try {
            System.out.println("Action: " + description);
            element.clear();
            element.sendKeys(text);
            System.out.println("Successfully sent keys to: " + description);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send keys to element: " + description + " - " + e.getMessage(), e);
        }
    }

    /**
     * Get text from an element with logging.
     *
     * @param description Description of the action
     * @param element     The WebElement to get text from
     * @return The element's text
     */
    public static String getText(String description, WebElement element) {
        try {
            System.out.println("Action: Getting text from " + description);
            String text = element.getText();
            System.out.println("Text retrieved: " + text);
            return text;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get text from element: " + description + " - " + e.getMessage(), e);
        }
    }

    /**
     * Check if element is displayed.
     *
     * @param description Description of the action
     * @param element     The WebElement to check
     * @return true if displayed, false otherwise
     */
    public static boolean isDisplayed(String description, WebElement element) {
        try {
            System.out.println("Action: Checking if displayed - " + description);
            boolean displayed = element.isDisplayed();
            System.out.println("Element displayed: " + displayed);
            return displayed;
        } catch (Exception e) {
            System.err.println("Element not displayed: " + description);
            return false;
        }
    }

    /**
     * Check if element is enabled.
     *
     * @param description Description of the action
     * @param element     The WebElement to check
     * @return true if enabled, false otherwise
     */
    public static boolean isEnabled(String description, WebElement element) {
        try {
            System.out.println("Action: Checking if enabled - " + description);
            boolean enabled = element.isEnabled();
            System.out.println("Element enabled: " + enabled);
            return enabled;
        } catch (Exception e) {
            System.err.println("Element not enabled: " + description);
            return false;
        }
    }

    /**
     * Enter text into an element (clear first, then send keys) with logging.
     *
     * @param description Description of the action
     * @param element     The WebElement to enter text into
     * @param text        The text to enter
     */
    public static void enterTextWithSubmit(String description, WebElement element, String text) {
        try {
            System.out.println("Action: " + description);
            element.clear();
            element.sendKeys(text);
            System.out.println("Successfully entered text: " + description);
        } catch (Exception e) {
            throw new RuntimeException("Failed to enter text: " + description + " - " + e.getMessage(), e);
        }
    }

    /**
     * Select a value from a dropdown/combobox with logging.
     * Uses JavaScript-first selection to avoid ChromeDriver click-hang on <select> options.
     * Falls back to native Selenium Select API if JS doesn't find the option.
     *
     * @param description Description of the action
     * @param element     The select WebElement
     * @param visibleText The visible text option to select
     */
    public static void selectFromComboBox(String description, WebElement element, String visibleText) {
        try {
            System.out.println("Action: " + description);

            // Strategy 1: JavaScript — sets selectedIndex directly, no .click() (avoids ChromeDriver hang)
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            Long jsResult = (Long) js.executeScript(
                "var sel = arguments[0]; var text = arguments[1].toLowerCase();" +
                "for (var i = 0; i < sel.options.length; i++) {" +
                "  if (sel.options[i].text.trim().toLowerCase() === text) {" +
                "    sel.selectedIndex = i;" +
                "    sel.dispatchEvent(new Event('change', {bubbles: true}));" +
                "    sel.dispatchEvent(new Event('input',  {bubbles: true}));" +
                "    return 1;" +
                "  }" +
                "} return 0;",
                element, visibleText
            );
            if (jsResult != null && jsResult == 1L) {
                System.out.println("Successfully selected (JS): " + description);
                return;
            }

            // Strategy 2: Native Selenium Select (fallback — may not work on all sites)
            Select select = new Select(element);
            select.selectByVisibleText(visibleText);
            System.out.println("Successfully selected: " + description);
        } catch (Exception e) {
            throw new RuntimeException("Failed to select from combo box: " + description + " - " + e.getMessage(), e);
        }
    }

    /**
     * Click an element without throwing exception on failure.
     *
     * @param description Description of the action
     * @param element     The WebElement to click
     */
    public static void clickElementOnly(String description, WebElement element) {
        try {
            System.out.println("Action: " + description);
            element.click();
            System.out.println("Successfully clicked: " + description);
        } catch (Exception e) {
            System.err.println("Click failed (non-fatal): " + description + " - " + e.getMessage());
        }
    }

    /**
     * Click an element using JavaScript executor as fallback.
     *
     * @param description Description of the action
     * @param element     The WebElement to click via JS
     */
    public static void clickByJavaScript(String description, WebElement element) {
        try {
            System.out.println("Action (JS): " + description);
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            js.executeScript("arguments[0].click();", element);
            System.out.println("Successfully clicked via JS: " + description);
        } catch (Exception e) {
            throw new RuntimeException("Failed to JS-click element: " + description + " - " + e.getMessage(), e);
        }
    }
}
