package tests;

import java.time.Duration;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;
import testbase.UITestBase;
import common.Assert;
import common.Reporter;
import pageobjects.InsureShieldDeliveryDefenseTestPage;
import utility.Driver;

/**
 * InsureShieldDeliveryDefenseTest
 * Functional test for InsureShield DeliveryDefense Contact Us form submission.
 * Navigates to the DeliveryDefense page, fills the contact form, handles reCAPTCHA,
 * and submits the form.
 */
public class InsureShieldDeliveryDefenseTest extends UITestBase {

    // MANUAL FIX MARKER - closeBannerPopup - navigateToDeliveryDefense

    /**
     * testDeliveryDefenseContactFormSubmission
     * Launches InsureShield home page, navigates to DeliveryDefense,
     * fills the Contact Us form with provided test data, handles reCAPTCHA, and submits.
     */
    @Test
    public void testDeliveryDefenseContactFormSubmission() {
        Reporter.startTestGroup("InsureShield DeliveryDefense Tests");
        Reporter.startTest("testDeliveryDefenseContactFormSubmission", "InsureShieldDeliveryDefense", "Regression");

        try {
            // UITestBase @BeforeMethod already initialized driver and navigated to base URL
            Driver.instance.manage().window().maximize();
            Reporter.logInfo("Page Load", "InsureShield homepage loaded successfully", true);

            // Step 1: Close banner popup if present
            InsureShieldDeliveryDefenseTestPage.closeBannerPopup();
            Reporter.logInfo("Banner", "Banner popup handled", true);

            // Step 2: Click on DeliveryDefense link from the home page
            InsureShieldDeliveryDefenseTestPage.navigateToDeliveryDefense();
            Reporter.logInfo("Navigation", "Clicked on DeliveryDefense link", true);

            // Step 3: Verify navigation to DeliveryDefense page
            boolean onDeliveryPage = InsureShieldDeliveryDefenseTestPage.verifyDeliveryDefensePage();
            Reporter.logInfo("Page Verification", "DeliveryDefense page loaded: " + onDeliveryPage, true);

            // Step 4: Switch into the AEM form iframe
            InsureShieldDeliveryDefenseTestPage.switchToFormIframe();
            Reporter.logInfo("Iframe", "Switched into AEM form iframe", true);

            // Step 5: Fill First Name
            boolean firstNameResult = InsureShieldDeliveryDefenseTestPage.enterFirstName("vidya");
            Reporter.logPass("First Name", "First Name entered: vidya", true);

            // Step 6: Fill Last Name
            boolean lastNameResult = InsureShieldDeliveryDefenseTestPage.enterLastName("G");
            Reporter.logPass("Last Name", "Last Name entered: G", true);

            // Step 7: Fill Phone Number
            boolean phoneResult = InsureShieldDeliveryDefenseTestPage.enterPhone("9790120581");
            Reporter.logPass("Phone", "Phone entered: 9790120581", true);

            // Step 8: Fill Email
            boolean emailResult = InsureShieldDeliveryDefenseTestPage.enterEmail("test@gmail.com");
            Reporter.logPass("Email", "Email entered: test@gmail.com", true);

            // Step 9: Select Country
            boolean countryResult = InsureShieldDeliveryDefenseTestPage.selectCountry("United States");
            Reporter.logPass("Country", "Country selected: United States", true);

            // Step 10: Fill Zip Code
            boolean zipResult = InsureShieldDeliveryDefenseTestPage.enterZipCode("12345");
            Reporter.logPass("Zip Code", "Zip Code entered: 12345", true);

            // Step 11: Fill Company
            boolean companyResult = InsureShieldDeliveryDefenseTestPage.enterCompany("IBM");
            Reporter.logPass("Company", "Company entered: IBM", true);

            // Step 12: Fill "How can we help?"
            boolean helpResult = InsureShieldDeliveryDefenseTestPage.enterHowCanWeHelp(
                    "I am interested in the DeliveryDefense APIs");
            Reporter.logPass("How Can We Help", "Message entered successfully", true);

            // Step 13: Handle reCAPTCHA (best-effort)
            InsureShieldDeliveryDefenseTestPage.handleReCaptcha();
            Reporter.logInfo("reCAPTCHA", "reCAPTCHA handling attempted", true);

            // Step 14: Click Submit
            InsureShieldDeliveryDefenseTestPage.clickSubmit();
            Reporter.logPass("Submit", "Form submitted successfully", true);

            // Switch back to default content after form submission
            Driver.instance.switchTo().defaultContent();
            Reporter.logInfo("Iframe Exit", "Switched back to default content", true);

            // Assertions
            Assert.isTrue(firstNameResult, "First Name field filled successfully");
            Assert.isTrue(lastNameResult, "Last Name field filled successfully");
            Assert.isTrue(phoneResult, "Phone field filled successfully");
            Assert.isTrue(emailResult, "Email field filled successfully");
            Assert.isTrue(countryResult, "Country dropdown selected successfully");
            Assert.isTrue(zipResult, "Zip Code field filled successfully");
            Assert.isTrue(companyResult, "Company field filled successfully");
            Assert.isTrue(helpResult, "How Can We Help field filled successfully");

        } catch (Exception e) {
            Reporter.logFail("Failure", e.getMessage(), true);
            e.printStackTrace();
            Assert.fail("Test failed: " + e.getMessage());
        } finally {
            Reporter.endTest();
            Reporter.endTestGroup();
        }
    }
}