package tests;

import java.time.Duration;
import org.testng.annotations.Test;
import testbase.UITestBase;
import common.Assert;
import common.Reporter;
import pageobjects.GeneratedTest_1771780645231Page;
import utility.Driver;

public class GeneratedTest_1771780645231 extends UITestBase {

    /**
     * Functional test for filling and submitting the "Request a Speaker" form.
     */
    @Test
    public void testScenario() {
        Reporter.startTestGroup("GeneratedTest_1771780645231 Tests");
        Reporter.startTest("testScenario", "GeneratedTest_1771780645231", "Regression");
        try {
            // Maximize browser window
            Driver.instance.manage().window().maximize();
            Reporter.logInfo("Browser Setup", "Browser window maximized", true);

            // Verify initial page load was successful
            Reporter.logInfo("Initial Page", "Homepage loaded successfully", true);

            // Close banner popup if present
            GeneratedTest_1771780645231Page.closeBannerPopup();

            // Navigate to "Request a Speaker" form
            GeneratedTest_1771780645231Page.navigateToRequestSpeakerForm();
            Reporter.logInfo("Navigation", "Navigated to request speaker form", true);

            // Switch to iframe containing the form
            GeneratedTest_1771780645231Page.switchToFormIframe();

            // Fill and submit the form
            boolean firstNameResult = GeneratedTest_1771780645231Page.enterFirstName("Vidya");
            Assert.isTrue(firstNameResult, "First Name filled successfully");
            Reporter.logPass("First Name", "First Name entered successfully", true);

            boolean lastNameResult = GeneratedTest_1771780645231Page.enterLastName("G");
            Assert.isTrue(lastNameResult, "Last Name filled successfully");
            Reporter.logPass("Last Name", "Last Name entered successfully", true);

            boolean organizationResult = GeneratedTest_1771780645231Page.enterOrganization("Conference");
            Assert.isTrue(organizationResult, "Organization filled successfully");
            Reporter.logPass("Organization", "Name of Organization entered successfully", true);

            boolean emailResult = GeneratedTest_1771780645231Page.enterEmail("Vidya.ganesan89@gmail.com");
            Assert.isTrue(emailResult, "Email filled successfully");
            Reporter.logPass("Email", "Email entered successfully", true);

            boolean confirmEmailResult = GeneratedTest_1771780645231Page.enterConfirmEmail("Vidya.ganesan89@gmail.com");
            Assert.isTrue(confirmEmailResult, "Confirmed Email filled successfully");
            Reporter.logPass("Confirm Email", "Confirm Email entered successfully", true);

            boolean countryCodeResult = GeneratedTest_1771780645231Page.selectCountryCode("India (+91)");
            Assert.isTrue(countryCodeResult, "Country code selected successfully");
            Reporter.logPass("Country Code", "Country Code selected successfully", true);

            boolean phoneResult = GeneratedTest_1771780645231Page.enterPhoneNumber("1234567890");
            Assert.isTrue(phoneResult, "Phone Number filled successfully");
            Reporter.logPass("Phone Number", "Phone Number entered successfully", true);

            boolean speakerResult = GeneratedTest_1771780645231Page.selectSpeakerRequested("Carol B Tomé");
            Assert.isTrue(speakerResult, "Speaker Requested selected successfully");
            Reporter.logPass("Speaker Requested", "Speaker Requested selected successfully", true);

            boolean eventTitleResult = GeneratedTest_1771780645231Page.enterEventTitle("TTT Conference");
            Assert.isTrue(eventTitleResult, "Event Title filled successfully");
            Reporter.logPass("Event Title", "Event Title entered successfully", true);

            boolean eventDateResult = GeneratedTest_1771780645231Page.enterEventDate("05/18/2026");
            Assert.isTrue(eventDateResult, "Event Date filled successfully");
            Reporter.logPass("Event Date", "Event Date entered successfully", true);

            boolean eventLocationResult = GeneratedTest_1771780645231Page.enterEventLocation("Chennai");
            Assert.isTrue(eventLocationResult, "Event Location filled successfully");
            Reporter.logPass("Event Location", "Event Location entered successfully", true);

            boolean topicResult = GeneratedTest_1771780645231Page.enterTopicOfPresentation("AI");
            Assert.isTrue(topicResult, "Topic of Presentation filled successfully");
            Reporter.logPass("Topic of Presentation", "Topic of Presentation entered successfully", true);

            boolean descriptionResult = GeneratedTest_1771780645231Page.enterEventDescription("Testing Conference");
            Assert.isTrue(descriptionResult, "Event Description filled successfully");
            Reporter.logPass("Event Description", "Event Description entered successfully", true);

            GeneratedTest_1771780645231Page.clickSendRequest();
            Reporter.logPass("Form Submission", "Form submitted successfully", true);

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