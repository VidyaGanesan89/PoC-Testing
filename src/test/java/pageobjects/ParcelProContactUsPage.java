package pageobjects;

import common.Assert;
import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

/**
 * Page Object: ParcelProContactUsPage
 * 
 * Description: Page Object Model for the ParcelPro Contact Us form
 * Contains all element locators and action methods for the Contact Us page
 * 
 * @author AI Test Generator
 * @date February 20, 2026
 */
public class ParcelProContactUsPage {

    // ********************************************************************************
    // Element Locators (Private Static Final)
    // ********************************************************************************
    
    private static final By CLOSE_ICON = By.cssSelector("button.banner-close-button");
    private static final By CONTACT_US_LINK = By.cssSelector("a[href*='contact-us.html']");
    private static final By INPUT_FIRSTNAME = By.xpath("//input[@aria-label='First Name']");
    private static final By INPUT_LASTNAME = By.xpath("//input[@aria-label='Last Name']");
    private static final By INPUT_COMPANY = By.xpath("//input[@aria-label='Company']");
    private static final By INPUT_EMAIL = By.xpath("//input[@aria-label='Email']");
    private static final By INPUT_PHONE = By.xpath("//input[@aria-label='Phone']");
    private static final By SELECT_COUNTRY = By.xpath("//select[@aria-label='Country / Territory']");
    private static final By SELECT_STATE = By.xpath("//select[@aria-label='State']");
    private static final By INPUT_ZIPCODE = By.xpath("//input[@aria-label='Zip Code / Postal Code']");
    private static final By TEXTAREA_ADDITIONAL_DETAILS = By.cssSelector("textarea[aria-label='Additional Details']");
    private static final By BUTTON_SUBMIT = By.cssSelector("button[aria-label='Submit']");
    private static final By RECAPTCHA_IFRAME = By.xpath("//iframe[@title='reCAPTCHA']");
    private static final By RECAPTCHA_CHECKBOX = By.cssSelector(".recaptcha-checkbox-border");
    private static final By SUCCESS_MESSAGE = By.cssSelector("[data-cmp-data-layer*='success']>p:last-child");

    // ********************************************************************************
    // Action Methods (Public Static)
    // ********************************************************************************
    
    /**
     * Close any initial banner or pop-up on the home page
     */
    public static void clickCloseIcon() {
        Driver.wait(2);
        try {
            ElementActions.clickElement("click close icon", Driver.instance.findElement(CLOSE_ICON));
        } catch (Exception e) {
            System.out.println("Close icon not found or already closed: " + e.getMessage());
        }
    }
    
    /**
     * Click the Contact Us link to navigate to the Contact Us page
     */
    public static void clickContactUslink() {
        ElementActions.clickElement("click Contact Us link", Driver.instance.findElement(CONTACT_US_LINK));
    }
    
    /**
     * Switch to the specified iframe
     * @param frameName - Name of the iframe to switch to
     */
    public static void switchToFrame(String frameName) {
        Driver.instance.switchTo().frame(frameName);
    }
    
    /**
     * Enter first name in the Contact Us form
     * @param firstName - First name to enter
     */
    public static void enterContactFirstName(String firstName) {
        Driver.waitForElementToBeVisible(INPUT_FIRSTNAME);
        ElementActions.enterTextWithSubmit("Enter first Name: " + firstName, 
            Driver.instance.findElement(INPUT_FIRSTNAME), firstName);
    }
    
    /**
     * Enter last name in the Contact Us form
     * @param lastName - Last name to enter
     */
    public static void enterContactLastName(String lastName) {
        ElementActions.enterTextWithSubmit("Enter last Name: " + lastName, 
            Driver.instance.findElement(INPUT_LASTNAME), lastName);
    }
    
    /**
     * Enter company name in the Contact Us form
     * @param company - Company name to enter
     */
    public static void enterContactCompanyName(String company) {
        ElementActions.enterTextWithSubmit("Enter company: " + company, 
            Driver.instance.findElement(INPUT_COMPANY), company);
    }
    
    /**
     * Enter email address in the Contact Us form
     * @param email - Email address to enter
     */
    public static void enterContactEmail(String email) {
        ElementActions.enterTextWithSubmit("Enter email: " + email, 
            Driver.instance.findElement(INPUT_EMAIL), email);
    }
    
    /**
     * Enter phone number in the Contact Us form
     * @param phoneNumber - Phone number to enter
     */
    public static void enterContactPhoneNumber(String phoneNumber) {
        ElementActions.enterTextWithSubmit("Enter Phone Number: " + phoneNumber, 
            Driver.instance.findElement(INPUT_PHONE), phoneNumber);
    }
    
    /**
     * Select country from dropdown in the Contact Us form
     * @param country - Country name to select
     */
    public static void enterContactCountry(String country) {
        ElementActions.selectFromComboBox("select country: " + country, 
            Driver.instance.findElement(SELECT_COUNTRY), country);
    }
    
    /**
     * Select state from dropdown in the Contact Us form
     * @param state - State name to select
     */
    public static void enterContactState(String state) {
        ElementActions.selectFromComboBox("select state: " + state, 
            Driver.instance.findElement(SELECT_STATE), state);
    }
    
    /**
     * Enter zip code in the Contact Us form
     * @param zipcode - Zip code to enter
     */
    public static void enterZipCode(String zipcode) {
        ElementActions.enterTextWithSubmit("Enter zip code: " + zipcode, 
            Driver.instance.findElement(INPUT_ZIPCODE), zipcode);
    }
    
    /**
     * Select service inquiry radio button or checkbox
     * @param checkbox - Service inquiry option text to select
     */
    public static void selectRadioBtn(String checkbox) {
        By checkboxLocator = By.xpath("//label[text()='" + checkbox + "']/.. ");
        try {
            ElementActions.clickElementOnly("select checkbox: " + checkbox, 
                Driver.instance.findElement(checkboxLocator));
        } catch (Exception ex) {
            ElementActions.clickByJavaScript("select checkbox: " + checkbox, 
                Driver.instance.findElement(checkboxLocator));
        }
    }
    
    /**
     * Enter additional details in the textarea
     * @param addDetails - Additional details text to enter
     */
    public static void enterContactAdditionalDetails(String addDetails) {
        ElementActions.enterTextWithSubmit("Enter Additional Details: " + addDetails, 
            Driver.instance.findElement(TEXTAREA_ADDITIONAL_DETAILS), addDetails);
    }
    
    /**
     * Submit the Contact Us form with reCAPTCHA handling and verify success message
     * This method:
     * 1. Switches to reCAPTCHA iframe
     * 2. Clicks the reCAPTCHA checkbox
     * 3. Switches back to form iframe
     * 4. Clicks the Submit button
     * 5. Waits for and verifies the success message
     */
    public static void clickContactSubmitBtnWithFlashMsg() {
        // Handle reCAPTCHA
        WebElement recaptchaIframe = Driver.instance.findElement(RECAPTCHA_IFRAME);
        Driver.instance.switchTo().frame(recaptchaIframe);
        Driver.waitForElementToBeEnabled(RECAPTCHA_CHECKBOX);
        
        try {
            ElementActions.clickElementOnly("click reCAPTCHA checkbox", 
                Driver.instance.findElement(RECAPTCHA_CHECKBOX));
        } catch (Exception ex) {
            ElementActions.clickByJavaScript("click reCAPTCHA checkbox", 
                Driver.instance.findElement(RECAPTCHA_CHECKBOX));
        }
        
        // Switch back to default content, then to form iframe
        Driver.instance.switchTo().defaultContent();
        Driver.instance.switchTo().frame("aemFormFrame");
        
        // Click Submit button
        try {
            ElementActions.clickElementOnly("click contact submit btn", 
                Driver.instance.findElement(BUTTON_SUBMIT));
        } catch (Exception ex) {
            ElementActions.clickByJavaScript("click contact submit btn", 
                Driver.instance.findElement(BUTTON_SUBMIT));
        }
        
        // Switch to default content and wait for success message
        Driver.instance.switchTo().defaultContent();
        
        // Wait for success message to appear
        new WebDriverWait(Driver.instance, Duration.ofSeconds(90))
            .until(ExpectedConditions.visibilityOfElementLocated(SUCCESS_MESSAGE));
        
        // Get and verify success message text
        String actualMessage = Driver.instance.findElement(SUCCESS_MESSAGE).getText();
        System.out.println("Success Message: " + actualMessage);
        
        // Verify expected success message
        Assert.areEqual(actualMessage, 
            "Thank you for your information. A representative will be in touch with you shortly.");
    }
}
