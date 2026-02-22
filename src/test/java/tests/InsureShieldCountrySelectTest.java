package tests;

import org.testng.annotations.Test;
import testbase.UITestBase;
import common.Assert;
import common.Reporter;
import pageobjects.InsureShieldCountrySelectTestPage;
import utility.Driver;

/**
 * InsureShieldCountrySelectTest
 *
 * Verifies the country/language selector flow on InsureShield:
 *   1. Launch https://insureshield3.ams1907.com/us/en/home.html
 *   2. Click the "United States - English" dropdown in the header
 *   3. Select "Another Country or Territory"
 *   4. Verify navigation to the global page
 *   5. Click "North America" and select "Canada – English"
 */
public class InsureShieldCountrySelectTest extends UITestBase {

    @Test
    public void testCountryLanguageSelection() {
        Reporter.startTestGroup("InsureShieldCountrySelectTest Tests");
        Reporter.startTest("testCountryLanguageSelection", "InsureShieldCountrySelectTest", "Regression");

        try {
            // UITestBase @BeforeMethod already initialized driver — navigate to InsureShield home
            Driver.instance.manage().window().maximize();
            InsureShieldCountrySelectTestPage.navigateToHome();
            Reporter.logPass("Navigation", "InsureShield home page loaded", true);

            // Step 2: Close any banner/cookie popup
            InsureShieldCountrySelectTestPage.closeBannerPopup();
            Reporter.logInfo("Banner", "Checked and dismissed any banner popup", true);

            // Step 3: Click the United States - English language dropdown in header
            InsureShieldCountrySelectTestPage.clickLanguageDropdown();
            Reporter.logPass("Language Dropdown", "Clicked 'United States - English' dropdown arrow in header", true);

            // Step 4: Select "Another Country or Territory" from the dropdown
            InsureShieldCountrySelectTestPage.selectAnotherCountry();
            Reporter.logPass("Country Selection", "Selected 'Another Country or Territory'", true);

            // Step 5: Verify navigation to the global page
            boolean onGlobalPage = InsureShieldCountrySelectTestPage.verifyGlobalPage();
            Assert.isTrue(onGlobalPage, "Should have navigated to InsureShield global page");
            Reporter.logPass("Global Page", "Navigated to global page: " + Driver.instance.getCurrentUrl(), true);

            // Step 6: Click "North America" region
            InsureShieldCountrySelectTestPage.clickNorthAmerica();
            Reporter.logPass("Region", "Clicked 'North America' region", true);

            // Step 7: Select "Canada – English"
            InsureShieldCountrySelectTestPage.selectCanadaEnglish();
            Reporter.logPass("Country/Language", "Selected 'Canada – English'", true);

            // Step 8: Verify Canada page was reached
            boolean onCanadaPage = InsureShieldCountrySelectTestPage.verifyCanadaPage();
            Assert.isTrue(onCanadaPage, "Should have navigated to Canada English page");
            Reporter.logPass("Final Verification", "Successfully on Canada English page: " + Driver.instance.getCurrentUrl(), true);

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
