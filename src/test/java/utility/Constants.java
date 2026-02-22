package utility;

/**
 * Constants class to store application-wide constants.
 */
public class Constants {
    
    // Timeout constants (in seconds)
    public static final int IMPLICIT_WAIT = 10;
    public static final int EXPLICIT_WAIT = 30;
    public static final int PAGE_LOAD_TIMEOUT = 60;
    
    // Application URLs
    public static final String BASE_URL = "https://parcelpro3.ams1907.com";
    public static final String GLOBAL_PAGE_URL = "https://www.parcelpro.com/us/en/global.html";
    
    // Browser constants
    public static final String CHROME = "chrome";
    public static final String FIREFOX = "firefox";
    public static final String EDGE = "edge";
    
    // Test data
    public static final String INITIAL_LANGUAGE = "United States - English";
    public static final String SELECT_ANOTHER_COUNTRY = "Select Another Country or Territory";
    public static final String ASIA_CONTINENT = "Asia & India Subcontinent";
    public static final String INDIA_ENGLISH = "Japan - English";
    
    // Test data file paths
    public static final String TESTDATA_PATH = "src/test/resources/testdata/";
    public static final String TESTDATA_FILE_PATH = TESTDATA_PATH;
    public static final String PARCEL_PRO_CONTACTUS = TESTDATA_PATH + "parcelProContactUs.properties";
    
    // Project paths
    public static final String PROJECT_PATH = System.getProperty("user.dir");
    public static final String REPORTS_PATH = PROJECT_PATH + "/reports/";
    
    // Private constructor to prevent instantiation
    private Constants() {
        throw new UnsupportedOperationException("Constants class cannot be instantiated");
    }
}
