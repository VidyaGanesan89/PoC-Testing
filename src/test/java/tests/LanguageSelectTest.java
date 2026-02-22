package tests;

import testbase.UITestBase;
import utility.Driver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;
import java.time.Duration;

/**
 * LanguageSelectTest automates the verification of the language selection feature
 * on the Parcel Pro website.
 */
public class LanguageSelectTest extends UITestBase {

    /**
     * Test to verify if the user can navigate through the language selection process and select "Germany – English".
     */
    @Test
    public void verifyLanguageSelection() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            // Step 1: Launch the URL
            System.out.println("[STEP 1] Launching the URL...");
            Driver.instance.get("https://parcelpro3.ams1907.com");

            // Step 2: Click language selector (typically displays "United States - English")
            System.out.println("[STEP 2] Clicking the language selector...");
            WebElement languageSelector = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".ups-language-selector")));
            languageSelector.click();

            // Step 3: Click on "Another Country or Territory"
            System.out.println("[STEP 3] Selecting 'Another Country or Territory'...");
            WebElement anotherCountryOption = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//a[contains(text(),'Another Country or Territory')]")));
            anotherCountryOption.click();

            // Step 4: Wait for navigation and verify the global page URL
            System.out.println("[STEP 4] Verifying navigation to global page...");
            wait.until(ExpectedConditions.urlToBe("https://parcelpro3.ams1907.com/us/en/global.html"));
            String currentUrl = Driver.instance.getCurrentUrl();
            Assert.assertEquals(currentUrl, "https://parcelpro3.ams1907.com/us/en/global.html", "Failed to navigate to the global page.");

            // Step 5: Select "Europe" and "Germany - English" from the global options
            System.out.println("[STEP 5] Selecting Europe and Germany - English...");
            
            // Click on Europe continent
            WebElement europeOption = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//a[contains(text(),'Europe')]")));
            europeOption.click();
            
            // Click on Germany - English language option
            WebElement germanyEnglishOption = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//a[contains(text(),'Germany') and contains(text(),'English')]")));
            germanyEnglishOption.click();

            // Step 6: Final assertion to confirm the selection success
            System.out.println("[STEP 6] Verifying the language selection result...");
            wait.until(ExpectedConditions.urlContains("de/en"));
            String finalUrl = Driver.instance.getCurrentUrl();
            System.out.println("[SUCCESS] Navigated to: " + finalUrl);
            Assert.assertTrue(finalUrl.contains("de/en") || finalUrl.contains("germany"), "Language selection verification failed!");

        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail("Test failed with exception: " + e.getMessage());
        }
    }
}