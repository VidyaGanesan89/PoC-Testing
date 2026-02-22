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
 * Page Object for UPS Request a Speaker Form
 * URL: https://stage.about.ups.com/us/en/request-a-speaker-form.html
 * All methods are static; locators use aria-label preferred strategy.
 */
public class GeneratedTest_1771779784051Page {

    // ── Navigation & Utility Locators ──────────────────────────────────────────
    private static final By BANNER_CLOSE_BUTTON = By.cssSelector("button.banner-close-button");

    // ── Form Field Locators ────────────────────────────────────────────────────
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
    private static final By TOPIC_OF_PRESENTATION_INPUT = By.xpath("//textarea[@aria-label='Topic of Presentation']");
    private static final By EVENT_DESCRIPTION_INPUT = By.xpath("//textarea[@aria-label='Event Description']");
    private static final By SEND_REQUEST_BUTTON = By.cssSelector("button[aria-label='Send Request']");

    // Smart select: handles accented chars (é), parentheses, encoding differences
    private static boolean smartSelect(WebElement selectEl, String optionText) {
        try { new Select(selectEl).selectByVisibleText(optionText); return true; } catch (Exception ignored) { }
        try {
            Select sel = new Select(selectEl);
            String lower = optionText.toLowerCase();
            for (WebElement opt : sel.getOptions()) {
                String txt = opt.getText().trim();
                if (txt.toLowerCase().contains(lower) || lower.contains(txt.toLowerCase())) {
                    sel.selectByVisibleText(txt); return true;
                }
            }
        } catch (Exception ignored) { }
        try {
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            Object found = js.executeScript(
                "var sel=arguments[0],t=arguments[1].toLowerCase();" +
                "for(var i=0;i<sel.options.length;i++){var o=(sel.options[i].text||'').toLowerCase();" +
                "if(o.indexOf(t)>=0||t.indexOf(o)>=0){sel.selectedIndex=i;" +
                "sel.dispatchEvent(new Event('change',{bubbles:true}));return true;}}return false;",
                selectEl, optionText);
            return Boolean.TRUE.equals(found);
        } catch (Exception ignored) { }
        return false;
    }

    /**
     * Attempts to close the banner popup if it is present on the page.
     * Logs info and continues silently if banner is not found.
     */
    public static void closeBannerPopup() {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(5));
            WebElement bannerClose = wait.until(ExpectedConditions.elementToBeClickable(BANNER_CLOSE_BUTTON));
            ElementActions.clickElement("Close banner popup", bannerClose);
            System.out.println("[INFO] Banner popup closed successfully.");
        } catch (Exception e) {
            System.out.println("[INFO] Banner popup not found or already dismissed: " + e.getMessage());
        }
    }

    /**
     * Navigates directly to the Request a Speaker form page.
     */
    public static void navigateToRequestSpeakerForm() {
        try {
            Driver.instance.get("https://stage.about.ups.com/us/en/request-a-speaker-form.html");
            System.out.println("[INFO] Navigated to Request a Speaker form URL.");
        } catch (Exception e) {
            System.out.println("[WARN] Failed to navigate to Request a Speaker form: " + e.getMessage());
        }
    }

    /**
     * Switches into the AEM form iframe so all form fields are accessible.
     * Tries by name 'aemFormFrame' first, then falls back to first iframe on page.
     * Must be called after navigation and URL verification, before any field interaction.
     */
    public static void switchToFormIframe() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt("aemFormFrame"));
            System.out.println("[INFO] Switched to iframe: aemFormFrame");
            return;
        } catch (Exception ignored) { }
        // Fallback: switch to the first available iframe
        List<WebElement> frames = Driver.instance.findElements(By.tagName("iframe"));
        if (!frames.isEmpty()) {
            try {
                Driver.instance.switchTo().frame(frames.get(0));
                System.out.println("[INFO] Switched to first available iframe.");
                return;
            } catch (Exception ignored) { }
        }
        System.out.println("[WARN] No iframe found — proceeding in main document.");
    }

    /**
     * Enters the First Name into the form field.
     *
     * @param firstName the first name value to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterFirstName(String firstName) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(FIRST_NAME_INPUT));
            ElementActions.enterTextWithSubmit("Enter First Name: " + firstName, element, firstName);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter First Name: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Last Name into the form field.
     *
     * @param lastName the last name value to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterLastName(String lastName) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(LAST_NAME_INPUT));
            ElementActions.enterTextWithSubmit("Enter Last Name: " + lastName, element, lastName);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Last Name: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Name of Organization Hosting Event into the form field.
     *
     * @param organization the organization name to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterOrganization(String organization) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(ORGANIZATION_INPUT));
            ElementActions.enterTextWithSubmit("Enter Organization: " + organization, element, organization);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Organization: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Email address into the form field.
     *
     * @param email the email address to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterEmail(String email) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EMAIL_INPUT));
            ElementActions.enterTextWithSubmit("Enter Email: " + email, element, email);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Email: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Confirm Email address into the form field.
     *
     * @param confirmEmail the confirm email address to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterConfirmEmail(String confirmEmail) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(CONFIRM_EMAIL_INPUT));
            ElementActions.enterTextWithSubmit("Enter Confirm Email: " + confirmEmail, element, confirmEmail);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Confirm Email: " + e.getMessage());
            return false;
        }
    }

    /**
     * Selects the Country Code from the dropdown.
     *
     * @param countryCode the country code option text to select (e.g., "India (+91)")
     * @return true if successful, false otherwise
     */
    public static boolean selectCountryCode(String countryCode) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(COUNTRY_CODE_SELECT));
            boolean ok = smartSelect(element, countryCode);
            System.out.println("[INFO] Country Code select: " + ok + " for: " + countryCode);
            return ok;
        } catch (Exception e) {
            System.out.println("[WARN] Could not select Country Code: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Phone Number into the form field.
     *
     * @param phoneNumber the phone number to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterPhoneNumber(String phoneNumber) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(PHONE_NUMBER_INPUT));
            ElementActions.enterTextWithSubmit("Enter Phone Number: " + phoneNumber, element, phoneNumber);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Phone Number: " + e.getMessage());
            return false;
        }
    }

    /**
     * Selects the Speaker Requested from the dropdown.
     *
     * @param speaker the speaker name to select (e.g., "Carol B Tomé")
     * @return true if successful, false otherwise
     */
    public static boolean selectSpeakerRequested(String speaker) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(SPEAKER_REQUESTED_SELECT));
            boolean ok = smartSelect(element, speaker);
            System.out.println("[INFO] Speaker Requested select: " + ok + " for: " + speaker);
            return ok;
        } catch (Exception e) {
            System.out.println("[WARN] Could not select Speaker Requested: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Event Title into the form field.
     *
     * @param eventTitle the event title to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterEventTitle(String eventTitle) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_TITLE_INPUT));
            ElementActions.enterTextWithSubmit("Enter Event Title: " + eventTitle, element, eventTitle);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Event Title: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Event Date into the form field.
     *
     * @param eventDate the event date to enter (format MM/DD/YYYY)
     * @return true if successful, false otherwise
     */
    public static boolean enterEventDate(String eventDate) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_DATE_INPUT));
            ElementActions.enterTextWithSubmit("Enter Event Date: " + eventDate, element, eventDate);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Event Date: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Event Location into the form field.
     *
     * @param eventLocation the event location to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterEventLocation(String eventLocation) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_LOCATION_INPUT));
            ElementActions.enterTextWithSubmit("Enter Event Location: " + eventLocation, element, eventLocation);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Event Location: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Topic of Presentation into the form textarea.
     *
     * @param topic the topic to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterTopicOfPresentation(String topic) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(TOPIC_OF_PRESENTATION_INPUT));
            ElementActions.enterTextWithSubmit("Enter Topic of Presentation: " + topic, element, topic);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Topic of Presentation: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the Event Description into the form textarea.
     *
     * @param description the event description to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterEventDescription(String description) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_DESCRIPTION_INPUT));
            ElementActions.enterTextWithSubmit("Enter Event Description: " + description, element, description);
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
            System.out.println("[INFO] Send Request button clicked successfully.");
        } catch (Exception e) {
            System.out.println("[WARN] Could not click Send Request button: " + e.getMessage());
        }
    }
}