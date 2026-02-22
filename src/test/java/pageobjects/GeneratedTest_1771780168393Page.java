package pageobjects;

import java.time.Duration;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import utility.Driver;
import utility.ElementActions;

/**
 * Page Object for the Request a Speaker Form on stage.about.ups.com
 * All methods are static and return boolean to indicate success/failure.
 */
public class GeneratedTest_1771780168393Page {

    // ── Locators ──────────────────────────────────────────────────────────────
    private static final By BANNER_CLOSE_BUTTON = By.cssSelector("button.banner-close-button");

    private static final By FIRST_NAME_INPUT = By.xpath("//input[@aria-label='First Name']");

    private static final By LAST_NAME_INPUT = By.xpath("//input[@aria-label='Last Name']");

    private static final By ORGANIZATION_INPUT = By.xpath("//input[@aria-label='Name of Organization Hosting Event']");

    private static final By EMAIL_INPUT = By.xpath("//input[@aria-label='Email']");

    private static final By CONFIRM_EMAIL_INPUT = By.xpath("//input[@aria-label='Confirm Email']");

    private static final By COUNTRY_CODE_SELECT = By.xpath("//select[@aria-label='Country Code']");

    private static final By PHONE_NUMBER_INPUT = By.xpath("//input[@aria-label='Phone Number']");

    private static final By SPEAKER_REQUESTED_SELECT = By.xpath("//select[@aria-label='Speaker Requested']");

    private static final By EVENT_TITLE_INPUT = By.xpath("//input[@aria-label='Event Title']");

    private static final By EVENT_DATE_INPUT = By.xpath("//input[@aria-label='Event Date']");

    private static final By EVENT_LOCATION_INPUT = By.xpath("//input[@aria-label='Event Location']");

    private static final By TOPIC_OF_PRESENTATION_TEXTAREA = By.xpath("//textarea[@aria-label='Topic of Presentation']");

    private static final By EVENT_DESCRIPTION_TEXTAREA = By.xpath("//textarea[@aria-label='Event Description']");

    private static final By SEND_REQUEST_BUTTON = By.cssSelector("button[aria-label='Send Request']");

    // ── Smart select helper (handles special chars, accented text, parentheses) ─
    private static boolean smartSelect(WebElement selectEl, String optionText) {
        // 1. Try exact visible text
        try {
            new Select(selectEl).selectByVisibleText(optionText);
            return true;
        } catch (Exception ignored) { }
        // 2. Try each option whose text contains the target (handles encoding differences)
        try {
            Select sel = new Select(selectEl);
            String lower = optionText.toLowerCase();
            for (WebElement opt : sel.getOptions()) {
                String txt = opt.getText().trim();
                if (txt.toLowerCase().contains(lower) || lower.contains(txt.toLowerCase())) {
                    sel.selectByVisibleText(txt);
                    return true;
                }
            }
        } catch (Exception ignored) { }
        // 3. JS: scan option text with indexOf (bypasses encoding)
        try {
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            String script =
                "var sel = arguments[0], target = arguments[1].toLowerCase();" +
                "for(var i=0;i<sel.options.length;i++){" +
                "  var t=(sel.options[i].text||'').toLowerCase();" +
                "  if(t.indexOf(target)>=0||target.indexOf(t)>=0){sel.selectedIndex=i;" +
                "    sel.dispatchEvent(new Event('change',{bubbles:true})); return true;}" +
                "} return false;";
            Object found = js.executeScript(script, selectEl, optionText);
            return Boolean.TRUE.equals(found);
        } catch (Exception ignored) { }
        return false;
    }

    // ── Banner ────────────────────────────────────────────────────────────────

    /**
     * Closes the banner popup if it is visible on the page.
     */
    public static void closeBannerPopup() {
        try {
            Driver.wait(2);
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(5));
            WebElement banner = wait.until(ExpectedConditions.visibilityOfElementLocated(BANNER_CLOSE_BUTTON));
            ElementActions.clickElement("Close banner popup", banner);
            System.out.println("[INFO] Banner popup closed.");
        } catch (Exception e) {
            System.out.println("[INFO] Banner popup not found or already closed: " + e.getMessage());
        }
    }

    // ── IFrame ────────────────────────────────────────────────────────────────

    /**
     * Switches WebDriver context into the AEM form iframe.
     * Tries by name first, then falls back to first available iframe.
     */
    public static void switchToFormIframe() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt("aemFormFrame"));
            System.out.println("[INFO] Switched to iframe: aemFormFrame");
            return;
        } catch (Exception ignored) {
            System.out.println("[INFO] iframe 'aemFormFrame' not found by name, trying fallback.");
        }
        List<WebElement> frames = Driver.instance.findElements(By.tagName("iframe"));
        if (!frames.isEmpty()) {
            try {
                Driver.instance.switchTo().frame(frames.get(0));
                System.out.println("[INFO] Switched to first available iframe as fallback.");
                return;
            } catch (Exception ignored) {
                System.out.println("[WARN] Fallback iframe switch failed.");
            }
        }
        System.out.println("[WARN] No iframe found - proceeding in main document.");
    }

    // ── Form Field Methods ────────────────────────────────────────────────────

    /**
     * Enters the First Name field.
     *
     * @param value First Name value
     * @return true if successful, false otherwise
     */
    public static boolean enterFirstName(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(FIRST_NAME_INPUT));
            ElementActions.enterTextWithSubmit("Enter First Name: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter First Name: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Last Name field.
     *
     * @param value Last Name value
     * @return true if successful, false otherwise
     */
    public static boolean enterLastName(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(LAST_NAME_INPUT));
            ElementActions.enterTextWithSubmit("Enter Last Name: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Last Name: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Name of Organization Hosting Event field.
     *
     * @param value Organization name value
     * @return true if successful, false otherwise
     */
    public static boolean enterOrganization(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(ORGANIZATION_INPUT));
            ElementActions.enterTextWithSubmit("Enter Organization: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Organization: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Email field.
     *
     * @param value Email address value
     * @return true if successful, false otherwise
     */
    public static boolean enterEmail(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EMAIL_INPUT));
            ElementActions.enterTextWithSubmit("Enter Email: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Email: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Confirm Email field.
     *
     * @param value Confirm Email address value
     * @return true if successful, false otherwise
     */
    public static boolean enterConfirmEmail(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(CONFIRM_EMAIL_INPUT));
            ElementActions.enterTextWithSubmit("Enter Confirm Email: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Confirm Email: " + e.getMessage());
            return false;
        }
    }

    /**
     * Selects the Country Code from the dropdown.
     *
     * @param option Country code option text (e.g., "India (+91)")
     * @return true if successful, false otherwise
     */
    public static boolean selectCountryCode(String option) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(COUNTRY_CODE_SELECT));
            boolean selected = smartSelect(element, option);
            System.out.println("[INFO] Country Code select result: " + selected + " for: " + option);
            return selected;
        } catch (Exception e) {
            System.out.println("[WARN] Could not select Country Code: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Phone Number field.
     *
     * @param value Phone number value
     * @return true if successful, false otherwise
     */
    public static boolean enterPhoneNumber(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(PHONE_NUMBER_INPUT));
            ElementActions.enterTextWithSubmit("Enter Phone Number: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Phone Number: " + e.getMessage());
            return false;
        }
    }

    /**
     * Selects the Speaker Requested from the dropdown.
     *
     * @param option Speaker option text (e.g., "Carol B Tomé")
     * @return true if successful, false otherwise
     */
    public static boolean selectSpeakerRequested(String option) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(SPEAKER_REQUESTED_SELECT));
            boolean selected = smartSelect(element, option);
            System.out.println("[INFO] Speaker Requested select result: " + selected + " for: " + option);
            return selected;
        } catch (Exception e) {
            System.out.println("[WARN] Could not select Speaker Requested: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Event Title field.
     *
     * @param value Event title value
     * @return true if successful, false otherwise
     */
    public static boolean enterEventTitle(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_TITLE_INPUT));
            ElementActions.enterTextWithSubmit("Enter Event Title: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Event Title: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Event Date field.
     *
     * @param value Event date value (format: MM/DD/YYYY)
     * @return true if successful, false otherwise
     */
    public static boolean enterEventDate(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_DATE_INPUT));
            ElementActions.enterTextWithSubmit("Enter Event Date: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Event Date: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Event Location field.
     *
     * @param value Event location value
     * @return true if successful, false otherwise
     */
    public static boolean enterEventLocation(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_LOCATION_INPUT));
            ElementActions.enterTextWithSubmit("Enter Event Location: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Event Location: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Topic of Presentation textarea.
     *
     * @param value Topic value
     * @return true if successful, false otherwise
     */
    public static boolean enterTopicOfPresentation(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(TOPIC_OF_PRESENTATION_TEXTAREA));
            ElementActions.enterTextWithSubmit("Enter Topic of Presentation: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Topic of Presentation: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Event Description textarea.
     *
     * @param value Event description value
     * @return true if successful, false otherwise
     */
    public static boolean enterEventDescription(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_DESCRIPTION_TEXTAREA));
            ElementActions.enterTextWithSubmit("Enter Event Description: " + value, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Event Description: " + e.getMessage());
            return false;
        }
    }

    /**
     * Clicks the Send Request button to submit the form.
     */
    public static void clickSendRequest() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.elementToBeClickable(SEND_REQUEST_BUTTON));
            ElementActions.clickElement("Click Send Request button", element);
            System.out.println("[INFO] Send Request button clicked.");
        } catch (Exception e) {
            System.out.println("[WARN] Could not click Send Request button: " + e.getMessage());
        }
    }
}