package pageobjects;

import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

/**
 * MANUAL FIX MARKER - closeBannerPopup - navigateToPage
 * Fallback page object - configure AI for smart generation
 */
public class InsureShieldCountrySelectTestPage {
    
    public static void closeBannerPopup() {
        try {
            Driver.wait(2);
            ElementActions.clickElement("Close banner popup", 
                Driver.instance.findElement(By.cssSelector("button.banner-close-button")));
        } catch (Exception e) {
            System.out.println("[INFO] Banner not found or already closed: " + e.getMessage());
        }
    }
}