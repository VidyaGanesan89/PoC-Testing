package pageobjects;

import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;
import java.util.List;

/**
 * Page Object: ContactUsFormTestPage
 * MANUAL FIX MARKER - closeBannerPopup - switchToFormIframe - navigateToContactUs
 * Correct locators matching the actual ParcelPro Contact Us page structure.
 * The form is inside an iframe "aemFormFrame" - must switch to it before interacting.
 * All form methods return boolean to indicate success/failure.
 */
public class ContactUsFormTestPage {

    // ============ Navigation & Banner Locators ============
    private static final By CLOSE_ICON = By.cssSelector("button.banner-close-button");
    private static final By CONTACT_US_LINK = By.cssSelector("a[href*='contact-us.html']");

    // ============ Form Field Locators (inside aemFormFrame iframe) ============
    // These aria-labels match the ACTUAL form fields discovered via diagnostic test
    private static final By FIRSTNAME_INPUT = By.xpath("//input[@aria-label='First Name']");
    private static final By LASTNAME_INPUT = By.xpath("//input[@aria-label='Last Name']");
    private static final By COMPANY_INPUT = By.xpath("//input[@aria-label='Company']");
    private static final By EMAIL_INPUT = By.xpath("//input[@aria-label='Email']");
    // Phone has 2 matching inputs; use CSS to target the visible one by position
    private static final By PHONE_INPUT = By.xpath("(//input[@aria-label='Phone'])[1]");
    private static final By COUNTRY_SELECT = By.xpath("//select[@aria-label='Country / Territory']");
    private static final By STATE_SELECT = By.xpath("//select[@aria-label='State']");
    private static final By ZIPCODE_INPUT = By.xpath("//input[@aria-label='Zip Code / Postal Code']");
    private static final By ADDITIONAL_DETAILS = By.cssSelector("textarea[aria-label='Additional Details']");
    private static final By SUBMIT_BUTTON = By.cssSelector("button[aria-label='Submit']");
    private static final By SUCCESS_MESSAGE = By.cssSelector("[data-cmp-data-layer*='success']>p:last-child");

    // ============ Navigation Methods ============

    /**
     * Close banner popup if present on the homepage (optional - won't fail test)
     */
    public static void closeBannerPopup() {
        try {
            Driver.wait(2);
            ElementActions.clickElement("Close banner popup", Driver.instance.findElement(CLOSE_ICON));
        } catch (Exception e) {
            System.out.println("[INFO] Banner not found or already closed");
        }
    }

    /**
     * Navigate to Contact Us page by clicking the link
     */
    public static void navigateToContactUs() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            WebElement link = wait.until(ExpectedConditions.elementToBeClickable(CONTACT_US_LINK));
            ElementActions.clickElement("Navigate to Contact Us page", link);
            Thread.sleep(3000);
        } catch (Exception e) {
            System.out.println("[WARN] Could not click Contact Us link, using direct URL fallback");
            try {
                Driver.instance.get("https://parcelpro3.ams1907.com/contact-us.html");
                Thread.sleep(3000);
                System.out.println("[INFO] Navigated directly to Contact Us page via URL fallback");
            } catch (Exception e2) {
                throw new RuntimeException("Failed to navigate to Contact Us page: " + e2.getMessage());
            }
        }
    }

    /**
     * Switch to the form iframe (aemFormFrame) where form elements reside
     */
    public static void switchToFormIframe() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(20));
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(
                By.cssSelector("iframe[name='aemFormFrame']")));
            Driver.instance.switchTo().frame("aemFormFrame");
            System.out.println("[INFO] Switched to aemFormFrame iframe");
            Thread.sleep(2000);
        } catch (Exception e) {
            System.out.println("[WARN] Could not switch to aemFormFrame by name, trying alternatives...");
            try {
                WebElement iframe = wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector("iframe[name='aemFormFrame'], iframe[title*='Form'], iframe[src*='contact']")));
                Driver.instance.switchTo().frame(iframe);
                System.out.println("[INFO] Switched to form iframe via element");
                Thread.sleep(2000);
            } catch (Exception e2) {
                throw new RuntimeException("Could not switch to form iframe: " + e2.getMessage());
            }
        }
    }

    /**
     * Switch back to default content from iframe
     */
    public static void switchToDefaultContent() {
        Driver.instance.switchTo().defaultContent();
    }

    // ============ Form Interaction Methods (all return boolean for success tracking) ============

    public static boolean enterFirstName(String firstName) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(FIRSTNAME_INPUT));
            element.clear();
            element.sendKeys(firstName);
            String value = element.getAttribute("value");
            boolean filled = value != null && !value.isEmpty();
            System.out.println("[" + (filled ? "OK" : "FAIL") + "] First Name: " + value);
            return filled;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not enter first name: " + e.getMessage());
            return false;
        }
    }

    public static boolean enterLastName(String lastName) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(LASTNAME_INPUT));
            element.clear();
            element.sendKeys(lastName);
            String value = element.getAttribute("value");
            boolean filled = value != null && !value.isEmpty();
            System.out.println("[" + (filled ? "OK" : "FAIL") + "] Last Name: " + value);
            return filled;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not enter last name: " + e.getMessage());
            return false;
        }
    }

    public static boolean enterCompany(String company) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(COMPANY_INPUT));
            element.clear();
            element.sendKeys(company);
            String value = element.getAttribute("value");
            boolean filled = value != null && !value.isEmpty();
            System.out.println("[" + (filled ? "OK" : "FAIL") + "] Company: " + value);
            return filled;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not enter company: " + e.getMessage());
            return false;
        }
    }

    public static boolean enterEmail(String email) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(EMAIL_INPUT));
            element.clear();
            element.sendKeys(email);
            String value = element.getAttribute("value");
            boolean filled = value != null && !value.isEmpty();
            System.out.println("[" + (filled ? "OK" : "FAIL") + "] Email: " + value);
            return filled;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not enter email: " + e.getMessage());
            return false;
        }
    }

    public static boolean enterPhone(String phone) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            // Find all phone inputs and use the first visible one
            List<WebElement> phoneInputs = Driver.instance.findElements(By.xpath("//input[@aria-label='Phone']"));
            System.out.println("[DEBUG] Found " + phoneInputs.size() + " phone input(s)");
            WebElement visiblePhone = null;
            for (int i = 0; i < phoneInputs.size(); i++) {
                WebElement p = phoneInputs.get(i);
                boolean displayed = p.isDisplayed();
                System.out.println("[DEBUG] Phone input[" + i + "] displayed=" + displayed + " tag=" + p.getTagName() + " type=" + p.getAttribute("type"));
                if (displayed && visiblePhone == null) {
                    visiblePhone = p;
                }
            }
            if (visiblePhone == null) {
                visiblePhone = wait.until(ExpectedConditions.visibilityOfElementLocated(PHONE_INPUT));
            }

            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            // Scroll into view
            js.executeScript("arguments[0].scrollIntoView({block: 'center'});", visiblePhone);
            Thread.sleep(500);

            // Click to focus the field first
            visiblePhone.click();
            Thread.sleep(300);

            // Clear any existing value
            visiblePhone.clear();
            Thread.sleep(200);

            // Type each character individually with small delay (handles masked/formatted inputs)
            for (char c : phone.toCharArray()) {
                visiblePhone.sendKeys(String.valueOf(c));
                Thread.sleep(50);
            }
            Thread.sleep(500);

            // Read value back
            String value = visiblePhone.getAttribute("value");
            System.out.println("[DEBUG] Phone value after sendKeys: '" + value + "'");

            // If sendKeys didn't stick, use JavaScript to force the value
            if (value == null || value.replaceAll("[^0-9]", "").isEmpty()) {
                System.out.println("[DEBUG] sendKeys failed for phone, trying JavaScript...");
                js.executeScript(
                    "var el = arguments[0]; " +
                    "var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; " +
                    "nativeInputValueSetter.call(el, arguments[1]); " +
                    "el.dispatchEvent(new Event('input', { bubbles: true })); " +
                    "el.dispatchEvent(new Event('change', { bubbles: true })); " +
                    "el.dispatchEvent(new Event('blur', { bubbles: true }));",
                    visiblePhone, phone);
                Thread.sleep(500);
                value = visiblePhone.getAttribute("value");
                System.out.println("[DEBUG] Phone value after JS set: '" + value + "'");
            }

            // Check if value has digits (phone may be formatted like (404) 555-1234)
            boolean filled = value != null && !value.replaceAll("[^0-9]", "").isEmpty();
            System.out.println("[" + (filled ? "OK" : "FAIL") + "] Phone: " + value);
            return filled;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not enter phone: " + e.getMessage());
            return false;
        }
    }

    public static boolean selectCountry(String country) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(COUNTRY_SELECT));
            // Scroll to country dropdown
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            js.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
            Thread.sleep(500);
            new org.openqa.selenium.support.ui.Select(element).selectByVisibleText(country);
            Thread.sleep(1000); // Wait for dependent fields (state, zip) to appear
            String selectedValue = new org.openqa.selenium.support.ui.Select(element).getFirstSelectedOption().getText();
            boolean selected = selectedValue != null && !selectedValue.isEmpty() && !selectedValue.equals("Select");
            System.out.println("[" + (selected ? "OK" : "FAIL") + "] Country: " + selectedValue);
            return selected;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not select country: " + e.getMessage());
            return false;
        }
    }

    public static boolean selectState(String state) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(STATE_SELECT));
            new org.openqa.selenium.support.ui.Select(element).selectByVisibleText(state);
            String selectedValue = new org.openqa.selenium.support.ui.Select(element).getFirstSelectedOption().getText();
            boolean selected = selectedValue != null && selectedValue.equals(state);
            System.out.println("[" + (selected ? "OK" : "FAIL") + "] State: " + selectedValue);
            return selected;
        } catch (Exception e) {
            System.out.println("[WARN] Could not select state (may not be visible for this country): " + e.getMessage());
            return false;
        }
    }

    public static boolean enterZipCode(String zipCode) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
        try {
            // Zip code may need scrolling and time to appear after country selection
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            // Try to scroll down to make the zip code field visible
            js.executeScript("window.scrollBy(0, 300);");
            Thread.sleep(1000);

            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(ZIPCODE_INPUT));
            js.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
            Thread.sleep(500);
            element.clear();
            element.sendKeys(zipCode);
            String value = element.getAttribute("value");
            boolean filled = value != null && !value.isEmpty();
            System.out.println("[" + (filled ? "OK" : "FAIL") + "] Zip Code: " + value);
            return filled;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not enter zip code: " + e.getMessage());
            // Try JavaScript as fallback
            try {
                WebElement element = Driver.instance.findElement(ZIPCODE_INPUT);
                JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
                js.executeScript("arguments[0].scrollIntoView(true); arguments[0].value='" + zipCode + "'; arguments[0].dispatchEvent(new Event('input'));", element);
                String value = element.getAttribute("value");
                boolean filled = value != null && !value.isEmpty();
                System.out.println("[" + (filled ? "OK-JS" : "FAIL-JS") + "] Zip Code (JS fallback): " + value);
                return filled;
            } catch (Exception e2) {
                System.out.println("[FAIL] Zip code JS fallback also failed: " + e2.getMessage());
                return false;
            }
        }
    }

    public static boolean selectServiceInquiry(String serviceOption) {
        try {
            By checkboxLocator = By.xpath("//label[normalize-space(text())='" + serviceOption + "']/..");
            try {
                WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(5));
                WebElement parentElement = wait.until(ExpectedConditions.presenceOfElementLocated(checkboxLocator));
                ElementActions.clickElement("Select service inquiry: " + serviceOption, parentElement);
                System.out.println("[OK] Service Inquiry: " + serviceOption);
                return true;
            } catch (Exception ex) {
                // Fallback: try the radio input directly
                try {
                    By radioLocator = By.xpath("//input[@aria-label='" + serviceOption + "']");
                    WebElement radio = Driver.instance.findElement(radioLocator);
                    JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
                    js.executeScript("arguments[0].click();", radio);
                    System.out.println("[OK] Service Inquiry (radio click): " + serviceOption);
                    return true;
                } catch (Exception ex2) {
                    // Fallback: try contains-text match on label
                    try {
                        By containsLocator = By.xpath("//label[contains(text(),'" + serviceOption.substring(0, Math.min(serviceOption.length(), 20)) + "')]/..");
                        WebElement el = Driver.instance.findElement(containsLocator);
                        JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
                        js.executeScript("arguments[0].click();", el);
                        System.out.println("[OK] Service Inquiry (contains match): " + serviceOption);
                        return true;
                    } catch (Exception ex3) {
                        System.out.println("[FAIL] Could not select service inquiry radio: " + ex3.getMessage());
                        return false;
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("[FAIL] Service inquiry option not found: " + e.getMessage());
            return false;
        }
    }

    public static boolean enterAdditionalDetails(String details) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            // Scroll down to Additional Details textarea
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            js.executeScript("window.scrollBy(0, 300);");
            Thread.sleep(500);
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(ADDITIONAL_DETAILS));
            js.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
            Thread.sleep(500);
            element.clear();
            element.sendKeys(details);
            String value = element.getAttribute("value");
            boolean filled = value != null && !value.isEmpty();
            System.out.println("[" + (filled ? "OK" : "FAIL") + "] Additional Details: filled (" + (value != null ? value.length() : 0) + " chars)");
            return filled;
        } catch (Exception e) {
            System.out.println("[FAIL] Could not enter additional details: " + e.getMessage());
            return false;
        }
    }

    /**
     * Attempt to handle reCAPTCHA by clicking the checkbox in the reCAPTCHA iframe.
     * reCAPTCHA is nested inside the aemFormFrame as a separate iframe.
     * Returns true if checkbox was clicked, false if not possible (bot detection).
     */
    public static boolean handleRecaptcha() {
        try {
            // Scroll down to make reCAPTCHA visible
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            js.executeScript("window.scrollTo(0, document.body.scrollHeight);");
            Thread.sleep(1000);

            // Find the reCAPTCHA iframe inside the form iframe
            // reCAPTCHA iframes typically have title='reCAPTCHA' or src containing 'recaptcha'
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
            WebElement recaptchaFrame = null;
            try {
                recaptchaFrame = wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector("iframe[title='reCAPTCHA'], iframe[src*='recaptcha']")));
            } catch (Exception e) {
                System.out.println("[INFO] reCAPTCHA iframe not found - may not be present on this page");
                return false;
            }

            // Switch into the reCAPTCHA iframe
            Driver.instance.switchTo().frame(recaptchaFrame);
            Thread.sleep(1000);

            // Click the reCAPTCHA checkbox
            WebElement checkbox = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".recaptcha-checkbox-border, .recaptcha-checkbox, #recaptcha-anchor")));
            checkbox.click();
            System.out.println("[OK] reCAPTCHA checkbox clicked");

            // Wait for reCAPTCHA to process
            Thread.sleep(3000);

            // Check if checkbox is now checked (aria-checked attribute)
            try {
                WebElement anchor = Driver.instance.findElement(By.cssSelector("#recaptcha-anchor"));
                String checked = anchor.getAttribute("aria-checked");
                System.out.println("[INFO] reCAPTCHA checked state: " + checked);
            } catch (Exception e) {
                // ignore   
            }

            // Switch back to the form iframe (parent frame)
            Driver.instance.switchTo().parentFrame();
            System.out.println("[INFO] Switched back to form iframe after reCAPTCHA");
            return true;

        } catch (Exception e) {
            System.out.println("[WARN] reCAPTCHA handling failed (bot detection likely): " + e.getMessage());
            // Switch back to form iframe context in case we got stuck in reCAPTCHA frame
            try {
                Driver.instance.switchTo().parentFrame();
            } catch (Exception ex) {
                // already in correct frame
            }
            return false;
        }
    }

    public static void clickSubmitButton() {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        try {
            WebElement element = wait.until(ExpectedConditions.presenceOfElementLocated(SUBMIT_BUTTON));
            JavascriptExecutor js = (JavascriptExecutor) Driver.instance;
            js.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
            Thread.sleep(1000);
            js.executeScript("arguments[0].click();", element);
            System.out.println("[OK] Submit button clicked");
            Thread.sleep(2000);
        } catch (Exception e) {
            System.out.println("[FAIL] Could not click submit button: " + e.getMessage());
        }
    }

    public static String getSubmissionSuccessMessage() {
        try {
            Driver.instance.switchTo().defaultContent();
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(30));
            WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(SUCCESS_MESSAGE));
            String message = element.getText();
            System.out.println("[INFO] Success Message: " + message);
            return message;
        } catch (Exception e) {
            System.out.println("[WARN] Success message not found: " + e.getMessage());
            return "Form submission attempted";
        }
    }
}