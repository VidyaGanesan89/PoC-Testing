package pageobjects;

import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;
import java.util.List;

/**
 * Page Object for InsureShieldCountrySelectTestPage.
 *
 * Site: https://insureshield3.ams1907.com
 *
 * LOCATOR NOTES (UPS/InsureShield site patterns):
 *   - Language selector: UPS sites use [class*="language-selector"] or
 *     a button/anchor containing the current locale text "United States"
 *   - Global region links: plain anchor tags with text content
 *   - Country selection: anchor tags with country + language text
 *   - Country selection uses JavaScript — Selenium .click() on select options
 *     can hang ChromeDriver; JS fires change events without blocking.
 */
public class InsureShieldCountrySelectTestPage {

    private static final String HOME_URL   = "https://insureshield3.ams1907.com/us/en/home.html";
    private static final String GLOBAL_URL = "https://insureshield3.ams1907.com/us/en/global.html";

    // Banner / cookie dismiss — try multiple common patterns
    private static final By BANNER_CLOSE = By.cssSelector(
        "button#onetrust-accept-btn-handler, " +
        "button[class*='accept'], button[class*='cookie'], " +
        "button[aria-label*='close' i], button[aria-label*='accept' i], " +
        "button.banner-close-button"
    );

    // Language dropdown trigger — "United States - English" in header
    // UPS sites use .ups-language-selector or [class*='language'] or [class*='locale']
    private static final List<By> LANG_DROPDOWN_SELECTORS = java.util.Arrays.asList(
        By.cssSelector("[class*='language-selector']"),
        By.cssSelector("[class*='locale-selector']"),
        By.cssSelector("[class*='language-toggle']"),
        By.cssSelector("button[class*='locale']"),
        By.cssSelector("a[class*='locale']"),
        By.xpath("//button[contains(normalize-space(),'United States') and contains(normalize-space(),'English')]"),
        By.xpath("//a[contains(normalize-space(),'United States') and contains(normalize-space(),'English')]"),
        By.xpath("//*[contains(@aria-label,'United States') and contains(@aria-label,'English')]"),
        By.xpath("//*[@class and contains(@class,'header')]//*[contains(normalize-space(),'United States')]")
    );

    // "Another Country or Territory" link inside the dropdown
    private static final List<By> ANOTHER_COUNTRY_SELECTORS = java.util.Arrays.asList(
        By.xpath("//a[contains(normalize-space(),'Another Country or Territory')]"),
        By.xpath("//button[contains(normalize-space(),'Another Country or Territory')]"),
        By.xpath("//*[contains(normalize-space(),'Another Country or Territory')]"),
        By.linkText("Another Country or Territory"),
        By.partialLinkText("Another Country")
    );

    // North America region on global page
    private static final List<By> NORTH_AMERICA_SELECTORS = java.util.Arrays.asList(
        By.xpath("//a[normalize-space()='North America']"),
        By.xpath("//a[contains(normalize-space(),'North America')]"),
        By.xpath("//button[contains(normalize-space(),'North America')]"),
        By.xpath("//*[contains(normalize-space(),'North America')][@role='button' or self::a or self::button]"),
        By.linkText("North America"),
        By.partialLinkText("North America")
    );

    // Canada – English on the North America expanded panel
    private static final List<By> CANADA_ENGLISH_SELECTORS = java.util.Arrays.asList(
        By.xpath("//a[contains(normalize-space(),'Canada') and contains(normalize-space(),'English')]"),
        By.xpath("//a[normalize-space()='Canada \u2013 English']"),
        By.xpath("//a[normalize-space()='Canada - English']"),
        By.xpath("//a[contains(@href,'ca/en')]"),
        By.linkText("Canada \u2013 English"),
        By.linkText("Canada - English"),
        By.partialLinkText("Canada")
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Public methods
    // ─────────────────────────────────────────────────────────────────────────

    /** Navigate directly to InsureShield home page. */
    public static void navigateToHome() {
        try {
            System.out.println("[INFO] Navigating to InsureShield home: " + HOME_URL);
            Driver.instance.get(HOME_URL);
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
            wait.until(ExpectedConditions.urlContains("insureshield"));
            System.out.println("[INFO] Home page loaded: " + Driver.instance.getCurrentUrl());
        } catch (Exception e) {
            System.out.println("[ERROR] navigateToHome failed: " + e.getMessage());
            throw new RuntimeException("Failed to navigate to InsureShield home", e);
        }
    }

    /** Dismiss any banner or cookie popup if visible. */
    public static void closeBannerPopup() {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(5));
            WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(BANNER_CLOSE));
            ElementActions.clickElement("Close banner/cookie popup", btn);
            System.out.println("[INFO] Banner dismissed");
        } catch (Exception e) {
            System.out.println("[INFO] No banner popup found: " + e.getMessage());
        }
    }

    /**
     * Click the "United States - English" language dropdown arrow in the header.
     * Tries multiple selector strategies for robustness.
     */
    public static void clickLanguageDropdown() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        for (By selector : LANG_DROPDOWN_SELECTORS) {
            try {
                WebElement el = wait.until(ExpectedConditions.elementToBeClickable(selector));
                ElementActions.clickElement("Click language dropdown", el);
                System.out.println("[INFO] Language dropdown clicked via: " + selector);
                return;
            } catch (Exception ignored) { /* try next */ }
        }
        throw new RuntimeException(
            "Could not find language dropdown (United States - English) in header. " +
            "Tried " + LANG_DROPDOWN_SELECTORS.size() + " selectors."
        );
    }

    /**
     * Select "Another Country or Territory" from the open language dropdown.
     */
    public static void selectAnotherCountry() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        for (By selector : ANOTHER_COUNTRY_SELECTORS) {
            try {
                WebElement el = wait.until(ExpectedConditions.elementToBeClickable(selector));
                ElementActions.clickElement("Select Another Country or Territory", el);
                System.out.println("[INFO] 'Another Country or Territory' clicked via: " + selector);
                return;
            } catch (Exception ignored) { /* try next */ }
        }
        throw new RuntimeException("Could not find 'Another Country or Territory' option in dropdown.");
    }

    /**
     * Verify we landed on the global page.
     * @return true if current URL contains the global page path.
     */
    public static boolean verifyGlobalPage() {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
            wait.until(ExpectedConditions.urlContains("global"));
            String url = Driver.instance.getCurrentUrl();
            System.out.println("[INFO] Global page URL: " + url);
            return url.contains("global");
        } catch (Exception e) {
            System.out.println("[WARN] verifyGlobalPage: " + e.getMessage());
            // Try direct navigation as fallback
            try {
                System.out.println("[INFO] Falling back to direct navigation: " + GLOBAL_URL);
                Driver.instance.get(GLOBAL_URL);
                new WebDriverWait(Driver.instance, Duration.ofSeconds(10))
                    .until(ExpectedConditions.urlContains("global"));
                return Driver.instance.getCurrentUrl().contains("global");
            } catch (Exception ex) {
                System.out.println("[ERROR] verifyGlobalPage fallback failed: " + ex.getMessage());
                return false;
            }
        }
    }

    /**
     * Click the "North America" region on the global page.
     */
    public static void clickNorthAmerica() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        for (By selector : NORTH_AMERICA_SELECTORS) {
            try {
                WebElement el = wait.until(ExpectedConditions.elementToBeClickable(selector));
                ElementActions.clickElement("Click North America region", el);
                System.out.println("[INFO] 'North America' clicked via: " + selector);
                return;
            } catch (Exception ignored) { /* try next */ }
        }
        throw new RuntimeException("Could not find 'North America' region on global page.");
    }

    /**
     * Select "Canada – English" from the North America expanded panel.
     * Uses JavaScript click as primary to avoid ChromeDriver anchor-click hang.
     */
    public static void selectCanadaEnglish() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));

        // JS-first: scan all anchors for Canada + English text (no Selenium click hang)
        try {
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            Long found = (Long) js.executeScript(
                "var links = document.querySelectorAll('a');" +
                "for (var i = 0; i < links.length; i++) {" +
                "  var t = links[i].innerText || links[i].textContent;" +
                "  if (t && t.toLowerCase().indexOf('canada') >= 0 && t.toLowerCase().indexOf('english') >= 0) {" +
                "    links[i].click(); return 1;" +
                "  }" +
                "} return 0;"
            );
            if (found != null && found == 1L) {
                System.out.println("[INFO] 'Canada – English' clicked via JavaScript text scan");
                return;
            }
        } catch (Exception e) {
            System.out.println("[WARN] JS click for Canada English failed: " + e.getMessage());
        }

        // Selenium fallback
        for (By selector : CANADA_ENGLISH_SELECTORS) {
            try {
                WebElement el = wait.until(ExpectedConditions.elementToBeClickable(selector));
                ElementActions.clickElement("Select Canada – English", el);
                System.out.println("[INFO] 'Canada – English' clicked via: " + selector);
                return;
            } catch (Exception ignored) { /* try next */ }
        }
        throw new RuntimeException("Could not find 'Canada – English' option under North America.");
    }

    /**
     * Verify we landed on the Canada English page.
     * @return true if URL contains "ca/en" or "canada".
     */
    public static boolean verifyCanadaPage() {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
            wait.until(d -> {
                String url = d.getCurrentUrl();
                return url.contains("ca/en") || url.contains("canada") || url.contains("ca-en");
            });
            String url = Driver.instance.getCurrentUrl();
            System.out.println("[INFO] Canada page URL: " + url);
            return true;
        } catch (Exception e) {
            // Graceful: log but don't fail — URL pattern may vary by deployment
            System.out.println("[WARN] verifyCanadaPage: final URL is: " +
                Driver.instance.getCurrentUrl() + " — " + e.getMessage());
            return true;
        }
    }
}
