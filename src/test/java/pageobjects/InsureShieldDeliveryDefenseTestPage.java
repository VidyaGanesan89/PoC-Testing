package pageobjects;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import utility.Driver;

/**
 * InsureShieldDeliveryDefenseTestPage
 * Page Object for InsureShield DeliveryDefense page and Contact Us form.
 *
 * AEM form platform: same ams1907.com stack as ParcelPro ContactUsFormTestPage.
 * All form fields use aria-label XPath selectors with fallback lists.
 * Iframe: aemFormFrame (must switchTo before any form interaction).
 * All methods are static; no constructor required.
 */
public class InsureShieldDeliveryDefenseTestPage {

    private static final String HOME_URL =
            "https://insureshield3.ams1907.com/us/en/home.html";
    private static final String DELIVERY_DEFENSE_URL =
            "https://insureshield3.ams1907.com/us/en/shipping-insurance/delivery-defense.html";

    // ─── Navigation / Banner ────────────────────────────────────────────────────
    private static final By BANNER_CLOSE_BUTTON = By.cssSelector(
            "button#onetrust-accept-btn-handler, "
            + "button[class*='accept'], button[class*='cookie'], "
            + "button[aria-label*='close' i], button[aria-label*='accept' i], "
            + "button.banner-close-button");

    private static final List<By> DELIVERY_DEFENSE_LINK_LOCATORS = Arrays.asList(
            By.cssSelector("a[href*='delivery-defense']"),
            By.xpath("//a[contains(@href,'delivery-defense')]"),
            By.xpath("//a[contains(normalize-space(),'DeliveryDefense')]"),
            By.xpath("//a[contains(normalize-space(),'Delivery Defense')]"),
            By.xpath("//nav//a[contains(@href,'delivery-defense')]"));

    // ─── Page Verification ──────────────────────────────────────────────────────
    private static final By DELIVERY_DEFENSE_HEADING = By.xpath(
            "//h1[contains(text(),'DeliveryDefense') or contains(text(),'Delivery Defense')]");

    // ─── AEM Form Iframe ────────────────────────────────────────────────────────
    private static final List<By> FORM_IFRAME_LOCATORS = Arrays.asList(
            By.cssSelector("iframe[name='aemFormFrame']"),
            By.cssSelector("iframe[id='aemFormFrame']"),
            By.cssSelector("iframe[src*='delivery-defense']"),
            By.cssSelector("iframe[title*='form' i]"),
            By.tagName("iframe"));

    // ─── Contact Us Form Field Locators (inside aemFormFrame) ──────────────────
    // First Name
    private static final List<By> FIRST_NAME_LOCATORS = Arrays.asList(
            By.xpath("//input[@aria-label='First Name']"),
            By.xpath("//input[contains(@aria-label,'First Name')]"),
            By.xpath("//input[@placeholder='First Name *']"),
            By.xpath("//input[contains(@placeholder,'First Name')]"),
            By.xpath("//input[@name='firstName']"),
            By.xpath("//label[contains(text(),'First Name')]/..//input"));

    // Last Name
    private static final List<By> LAST_NAME_LOCATORS = Arrays.asList(
            By.xpath("//input[@aria-label='Last Name']"),
            By.xpath("//input[contains(@aria-label,'Last Name')]"),
            By.xpath("//input[@placeholder='Last Name *']"),
            By.xpath("//input[contains(@placeholder,'Last Name')]"),
            By.xpath("//input[@name='lastName']"),
            By.xpath("//label[contains(text(),'Last Name')]/..//input"));

    // Phone Number
    private static final List<By> PHONE_LOCATORS = Arrays.asList(
            By.xpath("//input[@aria-label='Phone Number']"),
            By.xpath("//input[@aria-label='Phone']"),
            By.xpath("//input[contains(@aria-label,'Phone')]"),
            By.xpath("(//input[@aria-label='Phone'])[1]"),
            By.xpath("//input[@type='tel']"),
            By.xpath("//input[contains(@placeholder,'Phone')]"),
            By.xpath("//input[@name='phone']"),
            By.xpath("//input[@name='phoneNumber']"),
            By.xpath("//label[contains(text(),'Phone')]/..//input"));

    // Email
    private static final List<By> EMAIL_LOCATORS = Arrays.asList(
            By.xpath("//input[@aria-label='Email']"),
            By.xpath("//input[contains(@aria-label,'Email')]"),
            By.xpath("//input[@type='email']"),
            By.xpath("//input[@placeholder='Email *']"),
            By.xpath("//input[contains(@placeholder,'Email')]"),
            By.xpath("//input[@name='email']"),
            By.xpath("//label[contains(text(),'Email')]/..//input"));

    // Country
    private static final List<By> COUNTRY_LOCATORS = Arrays.asList(
            By.xpath("//select[@aria-label='Country / Territory']"),
            By.xpath("//select[@aria-label='Country']"),
            By.xpath("//select[contains(@aria-label,'Country')]"),
            By.xpath("//select[@name='country']"),
            By.xpath("//select[@name='Country']"),
            By.xpath("//label[contains(text(),'Country')]/..//select"),
            By.cssSelector("select[name*='country' i]"),
            By.cssSelector("select[aria-label*='country' i]"));

    // Zip Code / Postal Code
    private static final List<By> ZIP_CODE_LOCATORS = Arrays.asList(
            By.xpath("//input[@aria-label='Zip Code / Postal Code']"),
            By.xpath("//input[@aria-label='Zip Code']"),
            By.xpath("//input[@aria-label='Postal Code']"),
            By.xpath("//input[contains(@aria-label,'Zip')]"),
            By.xpath("//input[contains(@aria-label,'Postal')]"),
            By.xpath("//input[contains(@placeholder,'Zip')]"),
            By.xpath("//input[contains(@placeholder,'Postal')]"),
            By.xpath("//input[@name='zipCode']"),
            By.xpath("//input[@name='zip']"),
            By.xpath("//label[contains(text(),'Zip')]/..//input"),
            By.xpath("//label[contains(text(),'Postal')]/..//input"));

    // Company
    private static final List<By> COMPANY_LOCATORS = Arrays.asList(
            By.xpath("//input[@aria-label='Company']"),
            By.xpath("//input[contains(@aria-label,'Company')]"),
            By.xpath("//input[@placeholder='Company *']"),
            By.xpath("//input[contains(@placeholder,'Company')]"),
            By.xpath("//input[@name='company']"),
            By.xpath("//input[@name='companyName']"),
            By.xpath("//label[contains(text(),'Company')]/..//input"));

    // How can we help?
    private static final List<By> HOW_CAN_WE_HELP_LOCATORS = Arrays.asList(
            By.xpath("//textarea[@aria-label='How can we help?']"),
            By.xpath("//textarea[contains(@aria-label,'How can we help')]"),
            By.xpath("//textarea[contains(@aria-label,'How can')]"),
            By.xpath("//textarea[contains(@aria-label,'help')]"),
            By.xpath("//textarea[@aria-label='Additional Details']"),
            By.xpath("//textarea[contains(@aria-label,'Additional')]"),
            By.xpath("//textarea[contains(@placeholder,'How can')]"),
            By.xpath("//textarea[@name='message']"),
            By.xpath("//textarea[@name='howCanWeHelp']"),
            By.xpath("//textarea[@name='comments']"),
            By.xpath("//label[contains(text(),'How can')]/..//textarea"),
            By.tagName("textarea"));

    // Submit button
    private static final List<By> SUBMIT_LOCATORS = Arrays.asList(
            By.cssSelector("button[aria-label='Submit']"),
            By.xpath("//button[@aria-label='Submit']"),
            By.xpath("//button[@type='submit']"),
            By.xpath("//button[contains(normalize-space(),'Submit')]"),
            By.cssSelector("input[type='submit']"),
            By.xpath("//input[@type='submit']"));

    // reCAPTCHA
    private static final By RECAPTCHA_IFRAME =
            By.cssSelector("iframe[title='reCAPTCHA'], iframe[src*='recaptcha']");
    private static final By RECAPTCHA_CHECKBOX =
            By.cssSelector(".recaptcha-checkbox-border, .recaptcha-checkbox, #recaptcha-anchor");

    // ────────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPER
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Tries each By in the list in order; returns first visible WebElement found.
     * Returns null if nothing matches.
     */
    private static WebElement findFirstVisible(WebDriverWait wait, List<By> locators) {
        for (By by : locators) {
            try {
                WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(by));
                if (el != null && el.isDisplayed()) {
                    System.out.println("[DEBUG] Matched locator: " + by);
                    return el;
                }
            } catch (Exception ignored) {
                // try next
            }
        }
        return null;
    }

    /** Type text into element, using JS native-value-setter as fallback. */
    private static boolean typeText(WebElement el, String text) {
        try {
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            js.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
            Thread.sleep(300);
            el.click();
            el.clear();
            el.sendKeys(text);
            String val = el.getAttribute("value");
            if (val != null && !val.isEmpty()) {
                return true;
            }
            // JS fallback for reactive / masked inputs
            js.executeScript(
                    "var n=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;"
                    + "n.call(arguments[0],arguments[1]);"
                    + "arguments[0].dispatchEvent(new Event('input',{bubbles:true}));"
                    + "arguments[0].dispatchEvent(new Event('change',{bubbles:true}));",
                    el, text);
            Thread.sleep(200);
            val = el.getAttribute("value");
            return val != null && !val.isEmpty();
        } catch (Exception e) {
            System.out.println("[WARN] typeText failed: " + e.getMessage());
            return false;
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // PUBLIC STATIC METHODS
    // ────────────────────────────────────────────────────────────────────────────

    /** Closes the cookie/banner popup if present (non-fatal). */
    public static void closeBannerPopup() {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(5));
            WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(BANNER_CLOSE_BUTTON));
            btn.click();
            System.out.println("[INFO] Banner popup closed.");
        } catch (Exception e) {
            System.out.println("[INFO] Banner popup not found or already dismissed.");
        }
    }

    /**
     * Navigates to the DeliveryDefense page.
     * Tries to click the nav link first; falls back to direct URL.
     */
    public static void navigateToDeliveryDefense() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        for (By locator : DELIVERY_DEFENSE_LINK_LOCATORS) {
            try {
                WebElement link = wait.until(ExpectedConditions.elementToBeClickable(locator));
                link.click();
                System.out.println("[INFO] Clicked DeliveryDefense link via: " + locator);
                Thread.sleep(2000);
                return;
            } catch (Exception ignored) {
                // try next locator
            }
        }
        // All link locators failed — navigate directly
        System.out.println("[WARN] Nav link not found; navigating directly to: " + DELIVERY_DEFENSE_URL);
        Driver.instance.get(DELIVERY_DEFENSE_URL);
        try {
            Thread.sleep(3000);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    /** Returns true if the DeliveryDefense page URL is confirmed. */
    public static boolean verifyDeliveryDefensePage() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            wait.until(ExpectedConditions.urlContains("delivery-defense"));
            System.out.println("[INFO] DeliveryDefense URL confirmed: " + Driver.instance.getCurrentUrl());
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] URL check failed; checking heading.");
            try {
                WebElement h = wait.until(
                        ExpectedConditions.visibilityOfElementLocated(DELIVERY_DEFENSE_HEADING));
                return h.isDisplayed();
            } catch (Exception ex) {
                System.out.println("[WARN] DeliveryDefense heading not found: " + ex.getMessage());
                return false;
            }
        }
    }

    /**
     * Switches into the AEM form iframe.
     * Tries by CSS locators first, then by name, then first iframe on page.
     */
    public static void switchToFormIframe() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(20));

        // Scroll down so the form iframe is in viewport
        try {
            ((JavascriptExecutor) Driver.instance).executeScript("window.scrollBy(0, 400);");
            Thread.sleep(1000);
        } catch (Exception ignored) {}

        // Try CSS/tag locators
        for (By locator : FORM_IFRAME_LOCATORS) {
            try {
                WebElement iframe = wait.until(ExpectedConditions.presenceOfElementLocated(locator));
                Driver.instance.switchTo().frame(iframe);
                System.out.println("[INFO] Switched to form iframe via: " + locator);
                Thread.sleep(1500);
                return;
            } catch (Exception ignored) {}
        }
        // Last resort: switch by name directly
        try {
            Driver.instance.switchTo().frame("aemFormFrame");
            System.out.println("[INFO] Switched to form iframe by name.");
        } catch (Exception ex) {
            System.out.println("[WARN] Could not switch to form iframe: " + ex.getMessage());
            // Continue without iframe — form may be on the page directly
        }
    }

    /** Enters the First Name into the Contact Us form. */
    public static boolean enterFirstName(String firstName) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        WebElement el = findFirstVisible(wait, FIRST_NAME_LOCATORS);
        if (el == null) {
            System.out.println("[FAIL] First Name field not found.");
            return false;
        }
        boolean ok = typeText(el, firstName);
        System.out.println("[" + (ok ? "OK" : "FAIL") + "] First Name: " + firstName);
        return ok;
    }

    /** Enters the Last Name into the Contact Us form. */
    public static boolean enterLastName(String lastName) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        WebElement el = findFirstVisible(wait, LAST_NAME_LOCATORS);
        if (el == null) {
            System.out.println("[FAIL] Last Name field not found.");
            return false;
        }
        boolean ok = typeText(el, lastName);
        System.out.println("[" + (ok ? "OK" : "FAIL") + "] Last Name: " + lastName);
        return ok;
    }

    /** Enters the Phone Number into the Contact Us form. */
    public static boolean enterPhone(String phone) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        WebElement el = findFirstVisible(wait, PHONE_LOCATORS);
        if (el == null) {
            System.out.println("[FAIL] Phone field not found.");
            return false;
        }
        boolean ok = typeText(el, phone);
        // Phones may be formatted — check digit count
        if (!ok) {
            String val = el.getAttribute("value");
            ok = val != null && !val.replaceAll("[^0-9]", "").isEmpty();
        }
        System.out.println("[" + (ok ? "OK" : "FAIL") + "] Phone: " + phone);
        return ok;
    }

    /** Enters the Email into the Contact Us form. */
    public static boolean enterEmail(String email) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        WebElement el = findFirstVisible(wait, EMAIL_LOCATORS);
        if (el == null) {
            System.out.println("[FAIL] Email field not found.");
            return false;
        }
        boolean ok = typeText(el, email);
        System.out.println("[" + (ok ? "OK" : "FAIL") + "] Email: " + email);
        return ok;
    }

    /** Selects the country from the Country dropdown. */
    public static boolean selectCountry(String country) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        for (By locator : COUNTRY_LOCATORS) {
            try {
                WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
                JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
                js.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
                Thread.sleep(400);
                new Select(el).selectByVisibleText(country);
                Thread.sleep(1000);
                String selected = new Select(el).getFirstSelectedOption().getText();
                boolean ok = selected != null && !selected.isEmpty() && !selected.equalsIgnoreCase("Select");
                System.out.println("[" + (ok ? "OK" : "FAIL") + "] Country: " + selected);
                return ok;
            } catch (Exception ignored) {}
        }
        System.out.println("[FAIL] Could not select country: " + country);
        return false;
    }

    /** Enters the Zip Code / Postal Code. */
    public static boolean enterZipCode(String zipCode) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        // Scroll and wait a moment — zip field often appears only after country is selected
        try {
            ((JavascriptExecutor) Driver.instance).executeScript("window.scrollBy(0, 200);");
            Thread.sleep(800);
        } catch (Exception ignored) {}
        WebElement el = findFirstVisible(wait, ZIP_CODE_LOCATORS);
        if (el == null) {
            System.out.println("[FAIL] Zip Code field not found.");
            return false;
        }
        boolean ok = typeText(el, zipCode);
        System.out.println("[" + (ok ? "OK" : "FAIL") + "] Zip Code: " + zipCode);
        return ok;
    }

    /** Enters the Company name. */
    public static boolean enterCompany(String company) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        WebElement el = findFirstVisible(wait, COMPANY_LOCATORS);
        if (el == null) {
            System.out.println("[FAIL] Company field not found.");
            return false;
        }
        boolean ok = typeText(el, company);
        System.out.println("[" + (ok ? "OK" : "FAIL") + "] Company: " + company);
        return ok;
    }

    /** Enters the "How can we help?" message. */
    public static boolean enterHowCanWeHelp(String message) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            ((JavascriptExecutor) Driver.instance).executeScript("window.scrollBy(0, 300);");
            Thread.sleep(500);
        } catch (Exception ignored) {}
        WebElement el = findFirstVisible(wait, HOW_CAN_WE_HELP_LOCATORS);
        if (el == null) {
            System.out.println("[FAIL] How Can We Help textarea not found.");
            return false;
        }
        try {
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            js.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
            Thread.sleep(300);
            el.click();
            el.clear();
            el.sendKeys(message);
            String val = el.getAttribute("value");
            boolean ok = val != null && !val.isEmpty();
            System.out.println("[" + (ok ? "OK" : "FAIL") + "] How Can We Help: filled (" + (val != null ? val.length() : 0) + " chars)");
            return ok;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not enter How Can We Help: " + e.getMessage());
            return false;
        }
    }

    /**
     * Attempts to click the reCAPTCHA checkbox.
     * Switches into the reCAPTCHA iframe, clicks the checkbox, then returns to parent frame.
     * Non-fatal — reCAPTCHA may require human solving and cannot be automated fully.
     */
    public static void handleReCaptcha() {
        try {
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            js.executeScript("window.scrollTo(0, document.body.scrollHeight);");
            Thread.sleep(1000);

            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
            WebElement recaptchaFrame;
            try {
                recaptchaFrame = wait.until(
                        ExpectedConditions.presenceOfElementLocated(RECAPTCHA_IFRAME));
            } catch (Exception e) {
                System.out.println("[INFO] reCAPTCHA iframe not found — may not be present.");
                return;
            }

            Driver.instance.switchTo().frame(recaptchaFrame);
            Thread.sleep(1000);

            WebElement checkbox = wait.until(
                    ExpectedConditions.elementToBeClickable(RECAPTCHA_CHECKBOX));
            checkbox.click();
            System.out.println("[OK] reCAPTCHA checkbox clicked.");
            Thread.sleep(3000);

            // Check state
            try {
                WebElement anchor = Driver.instance.findElement(By.cssSelector("#recaptcha-anchor"));
                System.out.println("[INFO] reCAPTCHA checked state: " + anchor.getAttribute("aria-checked"));
            } catch (Exception ignored) {}

            Driver.instance.switchTo().parentFrame();
            System.out.println("[INFO] Returned to form iframe after reCAPTCHA.");
        } catch (Exception e) {
            System.out.println("[WARN] reCAPTCHA handling failed (bot detection expected): " + e.getMessage());
            try {
                Driver.instance.switchTo().parentFrame();
            } catch (Exception ignored) {}
        }
    }

    /** Clicks the form Submit button using JS to avoid intercept issues. */
    public static void clickSubmit() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        for (By locator : SUBMIT_LOCATORS) {
            try {
                WebElement btn = wait.until(ExpectedConditions.presenceOfElementLocated(locator));
                JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
                js.executeScript("arguments[0].scrollIntoView({block:'center'});", btn);
                Thread.sleep(700);
                js.executeScript("arguments[0].click();", btn);
                System.out.println("[OK] Submit button clicked via: " + locator);
                Thread.sleep(2000);
                return;
            } catch (Exception ignored) {}
        }
        System.out.println("[FAIL] Submit button not found with any locator.");
    }
}