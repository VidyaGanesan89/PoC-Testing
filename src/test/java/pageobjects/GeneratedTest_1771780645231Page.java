package pageobjects;

import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class GeneratedTest_1771780645231Page {

    private static final By BANNER_CLOSE = By.cssSelector("button.banner-close-button");
    private static final By REQUEST_SPEAKER_LINK = By.cssSelector("a[href*='/request-a-speaker-form.html']");
    private static final By FORM_IFRAME = By.cssSelector("iframe[name='aemFormFrame']");
    private static final By FIRST_NAME = By.xpath("//input[@aria-label='First Name']");
    private static final By LAST_NAME = By.xpath("//input[@aria-label='Last Name']");
    private static final By ORGANIZATION = By.xpath("//input[@aria-label='Name of Organization Hosting Event']");
    private static final By EMAIL = By.xpath("//input[@aria-label='Email']");
    private static final By CONFIRM_EMAIL = By.xpath("//input[@aria-label='Confirm Email']");
    private static final By COUNTRY_CODE = By.xpath("//select[@aria-label='Country Code']");
    private static final By PHONE_NUMBER = By.xpath("//input[@aria-label='Phone Number']");
    private static final By SPEAKER_REQUESTED = By.xpath("//select[@aria-label='Speaker Requested']");
    private static final By EVENT_TITLE = By.xpath("//input[@aria-label='Event Title']");
    private static final By EVENT_DATE = By.xpath("//input[@aria-label='Event Date']");
    private static final By EVENT_LOCATION = By.xpath("//input[@aria-label='Event Location']");
    private static final By TOPIC_PRESENTATION = By.xpath("//textarea[@aria-label='Topic of Presentation']");
    private static final By EVENT_DESCRIPTION = By.xpath("//textarea[@aria-label='Event Description']");
    private static final By SEND_REQUEST_BUTTON = By.cssSelector("button[aria-label='Send Request']");

    public static void closeBannerPopup() {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
            WebElement bannerCloseButton = wait.until(ExpectedConditions.visibilityOfElementLocated(BANNER_CLOSE));
            ElementActions.clickElement("Close banner popup", bannerCloseButton);
        } catch (Exception e) {
            System.out.println("[INFO] Banner popup not found: " + e.getMessage());
        }
    }

    public static void navigateToRequestSpeakerForm() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        WebElement requestSpeakerLink = wait.until(ExpectedConditions.visibilityOfElementLocated(REQUEST_SPEAKER_LINK));
        ElementActions.clickElement("Navigate to Request a Speaker form", requestSpeakerLink);
    }

    public static void switchToFormIframe() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(FORM_IFRAME));
        System.out.println("[INFO] Switched to form iframe successfully.");
    }

    public static boolean enterFirstName(String value) {
        return sendKeys(FIRST_NAME, "Enter First Name", value);
    }

    public static boolean enterLastName(String value) {
        return sendKeys(LAST_NAME, "Enter Last Name", value);
    }

    public static boolean enterOrganization(String value) {
        return sendKeys(ORGANIZATION, "Enter Organization", value);
    }

    public static boolean enterEmail(String value) {
        return sendKeys(EMAIL, "Enter Email", value);
    }

    public static boolean enterConfirmEmail(String value) {
        return sendKeys(CONFIRM_EMAIL, "Confirm Email", value);
    }

    public static boolean selectCountryCode(String value) {
        return selectDropdown(COUNTRY_CODE, "Select Country Code", value);
    }

    public static boolean enterPhoneNumber(String value) {
        return sendKeys(PHONE_NUMBER, "Enter Phone Number", value);
    }

    public static boolean selectSpeakerRequested(String value) {
        return selectDropdown(SPEAKER_REQUESTED, "Select Speaker Requested", value);
    }

    public static boolean enterEventTitle(String value) {
        return sendKeys(EVENT_TITLE, "Enter Event Title", value);
    }

    public static boolean enterEventDate(String value) {
        return sendKeys(EVENT_DATE, "Enter Event Date", value);
    }

    public static boolean enterEventLocation(String value) {
        return sendKeys(EVENT_LOCATION, "Enter Event Location", value);
    }

    public static boolean enterTopicOfPresentation(String value) {
        return sendKeys(TOPIC_PRESENTATION, "Enter Topic of Presentation", value);
    }

    public static boolean enterEventDescription(String value) {
        return sendKeys(EVENT_DESCRIPTION, "Enter Event Description", value);
    }

    public static void clickSendRequest() {
        ElementActions.clickElement("Click Send Request", Driver.instance.findElement(SEND_REQUEST_BUTTON));
    }

    private static boolean sendKeys(By locator, String actionDescription, String value) {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
            ElementActions.sendKeys(actionDescription, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Failed to " + actionDescription + ": " + e.getMessage());
            return false;
        }
    }

    private static boolean selectDropdown(By locator, String actionDescription, String value) {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
            ElementActions.selectFromComboBox(actionDescription, element, value);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Failed to " + actionDescription + ": " + e.getMessage());
            return false;
        }
    }
}