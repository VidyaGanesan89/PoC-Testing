package utility;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Driver utility class to manage WebDriver instance and common wait operations.
 */
public class Driver {
    public static WebDriver instance;
    private static WebDriverWait wait;
    private static final int DEFAULT_TIMEOUT = 30;

    /**
     * Initialize WebDriver based on browser type from properties.
     */
    public static void initializeDriver() {
        String browser = PropertyReader.getProperty("browser", "chrome");
        boolean headless = Boolean.parseBoolean(PropertyReader.getProperty("headless", "false"));

        try {
            switch (browser.toLowerCase()) {
                case "chrome":
                    WebDriverManager.chromedriver().setup();
                    ChromeOptions chromeOptions = new ChromeOptions();
                    if (headless) {
                        chromeOptions.addArguments("--headless=new");
                    }
                    chromeOptions.addArguments("--disable-gpu");
                    chromeOptions.addArguments("--window-size=1920,1080");
                    chromeOptions.addArguments("--no-sandbox");
                    chromeOptions.addArguments("--disable-dev-shm-usage");
                    instance = new ChromeDriver(chromeOptions);
                    break;

                case "firefox":
                    WebDriverManager.firefoxdriver().setup();
                    FirefoxOptions firefoxOptions = new FirefoxOptions();
                    if (headless) {
                        firefoxOptions.addArguments("--headless");
                    }
                    instance = new FirefoxDriver(firefoxOptions);
                    break;

                case "edge":
                    WebDriverManager.edgedriver().setup();
                    EdgeOptions edgeOptions = new EdgeOptions();
                    if (headless) {
                        edgeOptions.addArguments("--headless");
                    }
                    instance = new EdgeDriver(edgeOptions);
                    break;

                default:
                    throw new IllegalArgumentException("Unsupported browser: " + browser);
            }

            instance.manage().window().maximize();
            instance.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
            instance.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(60));
            wait = new WebDriverWait(instance, Duration.ofSeconds(DEFAULT_TIMEOUT));

        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize WebDriver: " + e.getMessage(), e);
        }
    }

    /**
     * Quit the WebDriver instance.
     */
    public static void quitDriver() {
        try {
            if (instance != null) {
                instance.quit();
                instance = null;
            }
        } catch (Exception e) {
            System.err.println("Error while quitting driver: " + e.getMessage());
        }
    }

    /**
     * Navigate to a URL.
     *
     * @param url The URL to navigate to
     */
    public static void navigateTo(String url) {
        try {
            instance.get(url);
        } catch (Exception e) {
            throw new RuntimeException("Failed to navigate to URL: " + url, e);
        }
    }

    /**
     * Wait for element to be visible.
     *
     * @param locator The By locator
     */
    public static void waitForElementToBeVisible(By locator) {
        try {
            wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        } catch (Exception e) {
            throw new RuntimeException("Element not visible: " + locator, e);
        }
    }

    /**
     * Wait for element to be clickable.
     *
     * @param locator The By locator
     */
    public static void waitForElementToBeClickable(By locator) {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(locator));
        } catch (Exception e) {
            throw new RuntimeException("Element not clickable: " + locator, e);
        }
    }

    /**
     * Wait for element to be enabled.
     *
     * @param locator The By locator
     */
    public static void waitForElementToBeEnabled(By locator) {
        try {
            waitForElementToBeVisible(locator);
            wait.until(driver -> driver.findElement(locator).isEnabled());
        } catch (Exception e) {
            throw new RuntimeException("Element not enabled: " + locator, e);
        }
    }

    /**
     * Custom wait method (use sparingly, prefer explicit waits).
     *
     * @param seconds Number of seconds to wait
     */
    public static void wait(int seconds) {
        try {
            Thread.sleep(seconds * 1000L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Thread interrupted during wait", e);
        }
    }

    /**
     * Wait for a WebElement to be visible.
     *
     * @param element The WebElement to wait for
     */
    public static void waitForElement(WebElement element) {
        try {
            WebDriverWait wait = new WebDriverWait(instance, Duration.ofSeconds(Constants.EXPLICIT_WAIT));
            wait.until(ExpectedConditions.visibilityOf(element));
        } catch (Exception e) {
            System.err.println("[WARNING] waitForElement timed out: " + e.getMessage());
        }
    }

    /**
     * Get current page title.
     *
     * @return The page title
     */
    public static String getPageTitle() {
        try {
            return instance.getTitle();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get page title", e);
        }
    }

    /**
     * Get current page URL.
     *
     * @return The current URL
     */
    public static String getCurrentUrl() {
        try {
            return instance.getCurrentUrl();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get current URL", e);
        }
    }

    /**
     * Capture screenshot and save to functional test screenshots folder
     *
     * @param screenshotName Name of the screenshot file (without extension)
     * @return Path to the saved screenshot
     */
    public static String takeScreenshot(String screenshotName) {
        try {
            // Create timestamp
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileName = screenshotName + "_" + timestamp + ".png";
            
            // Create screenshots directory if it doesn't exist
            Path screenshotsDir = Paths.get("functional test screenshots");
            if (!Files.exists(screenshotsDir)) {
                Files.createDirectories(screenshotsDir);
            }
            
            // Take screenshot
            File screenshot = ((TakesScreenshot) instance).getScreenshotAs(OutputType.FILE);
            
            // Save to functional test screenshots folder
            Path destination = screenshotsDir.resolve(fileName);
            Files.copy(screenshot.toPath(), destination, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("[SCREENSHOT] Saved: " + destination.toString());
            return destination.toString();
            
        } catch (IOException e) {
            System.err.println("[ERROR] Failed to capture screenshot: " + e.getMessage());
            return null;
        }
    }
}
