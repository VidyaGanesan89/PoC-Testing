package tests;

import java.time.Duration;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;
import testbase.UITestBase;
import common.Assert;
import common.Reporter;
import pageobjects.GeneratedTest_1771780168393Page;
import utility.Driver;

/**
 * UPS Enterprise Selenium TestNG Test
 * Scenario: Request a Speaker Form - stage.about.ups.com
 * Class: GeneratedTest_1771780168393
 */
public class GeneratedTest_1771780168393 extends UITestBase {

    // MANUAL FIX MARKER - closeBannerPopup - navigateToSpeakerForm - switchToFormIframe

    /**
     * Tests the "Request a Speaker" form on stage.about.ups.com
     * Fills all required fields and submits the form.
     */
    @Test
    public void testRequestASpeakerForm() {
        Reporter.startTestGroup("GeneratedTest_1771780168393 Tests");
        Reporter.startTest("testRequestASpeakerForm", "Request a Speaker Form", "Regression");
        try {
            // UITestBase @BeforeMethod already initialized driver and navigated to base URL
            Driver.instance.manage().window().maximize();
            Reporter.logInfo("Page Load", "Homepage loaded successfully", true);

            // Close banner popup if present
            GeneratedTest_1771780168393Page.closeBannerPopup();

            // Navigate directly to the Request a Speaker form page
            Driver.instance.get("https://stage.about.ups.com/us/en/request-a-speaker-form.html");
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
            wait.until(ExpectedConditions.urlContains("request-a-speaker-form"));
            Reporter.logInfo("Navigation", "Navigated to Request a Speaker form page", true);

            // Close banner popup again after navigation (may re-appear)
            GeneratedTest_1771780168393Page.closeBannerPopup();

            // Switch to AEM form iframe
            GeneratedTest_1771780168393Page.switchToFormIframe();
            Reporter.logInfo("IFrame Switch", "Switched to AEM form iframe", true);

            // Fill First Name
            boolean firstNameResult = GeneratedTest_1771780168393Page.enterFirstName("Vidya");
            Assert.isTrue(firstNameResult, "First Name entered successfully");
            Reporter.logPass("First Name", "First Name 'Vidya' filled successfully", true);

            // Fill Last Name
            boolean lastNameResult = GeneratedTest_1771780168393Page.enterLastName("G");
            Assert.isTrue(lastNameResult, "Last Name entered successfully");
            Reporter.logPass("Last Name", "Last Name 'G' filled successfully", true);

            // Fill Organization
            boolean orgResult = GeneratedTest_1771780168393Page.enterOrganization("Conference");
            Assert.isTrue(orgResult, "Organization entered successfully");
            Reporter.logPass("Organization", "Organization 'Conference' filled successfully", true);

            // Fill Email
            boolean emailResult = GeneratedTest_1771780168393Page.enterEmail("Vidya.ganesan89@gmail.com");
            Assert.isTrue(emailResult, "Email entered successfully");
            Reporter.logPass("Email", "Email filled successfully", true);

            // Fill Confirm Email
            boolean confirmEmailResult = GeneratedTest_1771780168393Page.enterConfirmEmail("Vidya.ganesan89@gmail.com");
            Assert.isTrue(confirmEmailResult, "Confirm Email entered successfully");
            Reporter.logPass("Confirm Email", "Confirm Email filled successfully", true);

            // Select Country Code - India (+91)
            boolean countryCodeResult = GeneratedTest_1771780168393Page.selectCountryCode("India (+91)");
            Assert.isTrue(countryCodeResult, "Country Code selected successfully");
            Reporter.logPass("Country Code", "Country Code 'India (+91)' selected successfully", true);

            // Fill Phone Number
            boolean phoneResult = GeneratedTest_1771780168393Page.enterPhoneNumber("1234567890");
            Assert.isTrue(phoneResult, "Phone Number entered successfully");
            Reporter.logPass("Phone Number", "Phone Number '1234567890' filled successfully", true);

            // Select Speaker Requested - Carol B Tomé
            boolean speakerResult = GeneratedTest_1771780168393Page.selectSpeakerRequested("Carol B Tomé");
            Assert.isTrue(speakerResult, "Speaker Requested selected successfully");
            Reporter.logPass("Speaker Requested", "Speaker 'Carol B Tomé' selected successfully", true);

            // Fill Event Title
            boolean eventTitleResult = GeneratedTest_1771780168393Page.enterEventTitle("TTT Conference");
            Assert.isTrue(eventTitleResult, "Event Title entered successfully");
            Reporter.logPass("Event Title", "Event Title 'TTT Conference' filled successfully", true);

            // Fill Event Date
            boolean eventDateResult = GeneratedTest_1771780168393Page.enterEventDate("05/18/2026");
            Assert.isTrue(eventDateResult, "Event Date entered successfully");
            Reporter.logPass("Event Date", "Event Date '05/18/2026' filled successfully", true);

            // Fill Event Location
            boolean eventLocationResult = GeneratedTest_1771780168393Page.enterEventLocation("Chennai");
            Assert.isTrue(eventLocationResult, "Event Location entered successfully");
            Reporter.logPass("Event Location", "Event Location 'Chennai' filled successfully", true);

            // Fill Topic of Presentation
            boolean topicResult = GeneratedTest_1771780168393Page.enterTopicOfPresentation("AI");
            Assert.isTrue(topicResult, "Topic of Presentation entered successfully");
            Reporter.logPass("Topic of Presentation", "Topic 'AI' filled successfully", true);

            // Fill Event Description
            boolean descResult = GeneratedTest_1771780168393Page.enterEventDescription("Testing Conference");
            Assert.isTrue(descResult, "Event Description entered successfully");
            Reporter.logPass("Event Description", "Event Description filled successfully", true);

            // Click Send Request button
            GeneratedTest_1771780168393Page.clickSendRequest();
            Reporter.logPass("Send Request", "Send Request button clicked successfully", true);

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