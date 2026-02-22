package pageobjects;

import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

/**
 * Page Object for UPS Request a Speaker Form
 * URL: https://stage.about.ups.com/us/en/request-a-speaker-form.html
 * All methods are static; no instance creation required.
 */
public class GeneratedTest_1771779003075Page {

    // --- Navigation Locators ---
    private static final By BANNER_CLOSE_BUTTON = By.cssSelector("button.banner-close-button");

    // --- Form Field Locators ---
    private static final By FIRST_NAME_INPUT = By.xpath("//input[@aria-label='First Name']");
    private static final By LAST_NAME_INPUT = By.xpath("//input[@aria-label='Last Name']");
    private static final By ORGANIZATION_NAME_INPUT = By.xpath("//input[@aria-label='Name of Organization Hosting Event']");
    private static final By EMAIL_INPUT = By.xpath("//input[@aria-label='Email']");
    private static final By CONFIRM_EMAIL_INPUT = By.xpath("//input[@aria-label='Confirm Email']");
    private static final By COUNTRY_CODE_SELECT = By.xpath("//select[@aria-label='Country Code']");
    private static final By PHONE_NUMBER_INPUT = By.xpath("//input[@aria-label='Phone Number']");
    private static final By SPEAKER_REQUESTED_SELECT = By.xpath("//select[@aria-label='Speaker Requested']");
    private static final By EVENT_TITLE_INPUT = By.xpath("//input[@aria-label='Event Title']");
    private static final By EVENT_DATE_INPUT = By.xpath("//input[@aria-label='Event Date']");
    private static final By EVENT_LOCATION_INPUT = By.xpath("//input[@aria-label='Event Location']");
    private static final By TOPIC_OF_PRESENTATION_INPUT = By.xpath("//input[@aria-label='Topic of Presentation']");
    private static final By EVENT_DESCRIPTION_TEXTAREA = By.xpath("//textarea[@aria-label='Event Description']");
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
     * Closes the banner popup if it is present on the page.
     */
    public static void closeBannerPopup() {
        try {
            Driver.wait(2);
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(5));
            WebElement bannerClose = wait.until(ExpectedConditions.elementToBeClickable(BANNER_CLOSE_BUTTON));
            ElementActions.clickElement("Close Banner Popup", bannerClose);
            System.out.println("[INFO] Banner popup closed successfully.");
        } catch (Exception e) {
            System.out.println("[INFO] Banner popup not present or already closed: " + e.getMessage());
        }
    }

    /**
     * Navigates directly to the Request a Speaker form URL.
     */
    public static void navigateToSpeakerForm() {
        try {
            Driver.instance.get("https://stage.about.ups.com/us/en/request-a-speaker-form.html");
            System.out.println("[INFO] Navigated to Request a Speaker form page.");
        } catch (Exception e) {
            System.out.println("[WARN] Could not navigate to speaker form: " + e.getMessage());
        }
    }

    /**
     * Switches to the AEM form iframe so form fields are accessible.
     * The UPS speaker request form is embedded inside an iframe named 'aemFormFrame'.
     * Must be called after navigation, before interacting with any form fields.
     */
    public static void switchToFormIframe() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        // Try to switch to aemFormFrame by name/id first
        try {
            wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt("aemFormFrame"));
            System.out.println("[INFO] Switched to iframe by name: aemFormFrame");
            return;
        } catch (Exception ignored) { }
        // Fallback: any iframe present on the page
        java.util.List<org.openqa.selenium.WebElement> frames =
            Driver.instance.findElements(By.tagName("iframe"));
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
     * Enters the first name into the First Name field.
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
     * Enters the last name into the Last Name field.
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
     * Enters the organization name into the Name of Organization Hosting Event field.
     *
     * @param orgName the organization name to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterOrganizationName(String orgName) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(ORGANIZATION_NAME_INPUT));
            ElementActions.enterTextWithSubmit("Enter Organization Name: " + orgName, element, orgName);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Organization Name: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the email address into the Email field.
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
     * Enters the confirm email address into the Confirm Email field.
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
     * Selects the country code from the Country Code dropdown.
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
     * Enters the phone number into the Phone Number field.
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
     * Selects the speaker requested from the Speaker Requested dropdown.
     *
     * @param speakerName the speaker name to select (e.g., "Carol B Tomé")
     * @return true if successful, false otherwise
     */
    public static boolean selectSpeakerRequested(String speakerName) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(SPEAKER_REQUESTED_SELECT));
            boolean ok = smartSelect(element, speakerName);
            System.out.println("[INFO] Speaker Requested select: " + ok + " for: " + speakerName);
            return ok;
        } catch (Exception e) {
            System.out.println("[WARN] Could not select Speaker Requested: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters the event title into the Event Title field.
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
     * Enters the event date into the Event Date field.
     *
     * @param eventDate the event date to enter (format: MM/DD/YYYY)
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
     * Enters the event location into the Event Location field.
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
     * Enters the topic of presentation into the Topic of Presentation field.
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
     * Enters the event description into the Event Description textarea.
     *
     * @param description the event description to enter
     * @return true if successful, false otherwise
     */
    public static boolean enterEventDescription(String description) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EVENT_DESCRIPTION_TEXTAREA));
            ElementActions.enterTextWithSubmit("Enter Event Description: " + description, element, description);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Could not enter Event Description: " + e.getMessage());
            return false;
        }
    }

    /**
     * Clicks the Send Request button to submit the speaker request form.
     */
    public static void clickSendRequest() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.elementToBeClickable(SEND_REQUEST_BUTTON));
            ElementActions.clickElement("Click Send Request Button", element);
            System.out.println("[INFO] Send Request button clicked successfully.");
        } catch (Exception e) {
            System.out.println("[WARN] Could not click Send Request button: " + e.getMessage());
        }
    }
}