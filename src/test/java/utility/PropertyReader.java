package utility;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * PropertyReader utility class to read properties from test.properties file.
 */
public class PropertyReader {
    private static Properties properties = new Properties();
    private static final String PROPERTIES_FILE = "src/test/resources/test.properties";

    static {
        loadProperties();
    }

    /**
     * Load properties from test.properties file.
     */
    private static void loadProperties() {
        try (InputStream input = new FileInputStream(PROPERTIES_FILE)) {
            properties.load(input);
            System.out.println("Properties loaded successfully from: " + PROPERTIES_FILE);
        } catch (IOException e) {
            System.err.println("Unable to load properties file: " + PROPERTIES_FILE);
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Get property value by key.
     *
     * @param key The property key
     * @return The property value, or null if not found
     */
    public static String getProperty(String key) {
        try {
            String value = properties.getProperty(key);
            if (value == null) {
                System.err.println("Property not found: " + key);
            }
            return value;
        } catch (Exception e) {
            throw new RuntimeException("Error reading property: " + key, e);
        }
    }

    /**
     * Get property value by key with default value.
     *
     * @param key          The property key
     * @param defaultValue The default value if property not found
     * @return The property value or default value
     */
    public static String getProperty(String key, String defaultValue) {
        try {
            String value = properties.getProperty(key, defaultValue);
            return value;
        } catch (Exception e) {
            System.err.println("Error reading property: " + key + ", using default: " + defaultValue);
            return defaultValue;
        }
    }

    /**
     * Get all properties.
     *
     * @return Properties object
     */
    public static Properties getAllProperties() {
        return properties;
    }

    /**
     * Read property file from a specific path.
     *
     * @param filePath The path to the properties file
     * @return Properties object loaded from the file
     */
    public static Properties readPropertyFile(String filePath) {
        Properties props = new Properties();
        try (InputStream input = new FileInputStream(filePath)) {
            props.load(input);
            System.out.println("Properties loaded successfully from: " + filePath);
        } catch (IOException e) {
            System.err.println("Unable to load properties file: " + filePath);
            System.err.println("Error: " + e.getMessage());
            throw new RuntimeException("Failed to load property file: " + filePath, e);
        }
        return props;
    }
}
