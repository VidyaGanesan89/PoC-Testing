package utility;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.mifmif.common.regex.Generex;
import environment.EnvironmentConfig;
import common.DriverBase;
import common.Reporter;
import data.DateHelper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.openqa.selenium.JavascriptExecutor;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.spec.KeySpec;
import java.util.ArrayList;
import java.util.Properties;
import java.util.Random;
import java.util.stream.Stream;


public class CommonUtils {
    private static final String UNICODE_FORMAT = "UTF8";
    public static final String DESEDE_ENCRYPTION_SCHEME = "DESede";
    private static Object QueueEnvironments;
    private KeySpec ks;
    private SecretKeyFactory skf;
    private Cipher cipher;
    byte[] arrayBytes;
    private String myEncryptionKey;
    private String myEncryptionScheme;
    SecretKey key;

    /**
     * This function parses json to array
     *
     * @param jsonMessage : message that need to parse
     */
    public static JSONArray parseJsontoArray(String jsonMessage) {
        JSONParser parser = new JSONParser();
        JSONArray array = null;
        try {
            Object obj = parser.parse(jsonMessage);
            array = (JSONArray) obj;
        } catch (ParseException pe) {
            System.out.println("position: " + pe.getPosition());
            System.out.println(pe);
        }
        return array;
    }

    /**
     * This function parses json to array
     *
     * @param jsonFilePath: path of the file
     */
    public static Object getJsonObject(String jsonFilePath) throws IOException {
        Object json = null;
        try {
            File jsonFile = getFileFromURL(jsonFilePath);
            FileReader reader = new FileReader(jsonFile);
            String jsonString = "";
            int temp = 0;
            while ((temp = reader.read()) != -1) {
                if (temp != 10 && temp != 13 && temp != 9) {
                    jsonString += (char) temp;
                }
            }
            reader.close();
            JSONParser parser = new JSONParser();
            json = parser.parse(jsonString);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return json;
    }

    /**
     * This function gets the values from json
     *
     * @param jsonfield : json field to get
     * @param jsonMsg   : jsonMsg
     * @return returns the vales of json key.
     * @throws IOException : Throws exception if
     */
    public static String getJsonFiledValue(String jsonfield, String jsonMsg) throws IOException {
        Object obj = null;
        String value = null;
        try {
            JSONParser parser = new JSONParser();
            obj = parser.parse(jsonMsg);
            JSONObject jsonObject = (JSONObject) obj;
            value = jsonObject.get(jsonfield).toString();
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return value;
    }

    /**
     * This function gets file from path
     *
     * @param relativefilepath : Path of the file
     * @return : returns file
     * @throws FileNotFoundException : throws exception if file not found
     */
    public static File getFileFromURL(String relativefilepath) throws FileNotFoundException {
        File file = null;
        try {

            System.out.println("filename in util : " + relativefilepath);
            //Get file from resources folder
            // ClassLoader classLoader = getClass().getClassLoader();
            //file = new File(classLoader.getResource(resourceName).getFile());
            file = new File(relativefilepath);
            System.out.println("filepath in util : " + file.getPath());

            if (file == null || !file.exists()) {
                throw new FileNotFoundException(relativefilepath);
            }
            //} catch (URISyntaxException e) {
        } catch (Exception e) {
            throw new FileNotFoundException(e.getLocalizedMessage());
        }
        return file;
    }

    /**
     * Reads file content.
     *
     * @param filePath : path of the file
     * @return : returns content of the file to a String
     * @throws IOException : throws exception if file not found
     */
    public static String readLineByLine(String filePath) throws IOException {
        StringBuilder contentBuilder = new StringBuilder();
        Stream<String> stream = Files.lines(Paths.get(filePath), StandardCharsets.UTF_8);
        String osName = System.getProperty("os.name").toLowerCase();
        if (osName.startsWith("windows")) {
            stream.forEach(s -> contentBuilder.append(s).append("\r\n"));
        }
        else {
            stream.forEach(s -> contentBuilder.append(s).append("\n"));
        }
        return contentBuilder.toString();
    }


    /**
     * This function updates the property in properties file
     *
     * @param key   : key need to be modified
     * @param value : value need to be modified for a key
     * @throws IOException : throws exception if file not found
     */
    public static void updateProperty(String key, String value) throws IOException {
        FileInputStream in = new FileInputStream("src/test/resources/properties/config.properties");
        Properties props = new Properties();
        props.load(in);
        in.close();

        FileOutputStream out = new FileOutputStream("src/test/resources/properties/config.properties");
        props.setProperty(key, value);
        props.store(out, null);
        out.close();
    }

    /**
     * Gets the value of key from properties file
     *
     * @param key : Key is field for which value need to be fetched
     * @return : returns the String : value of a key
     * @throws IOException : throws exception if file not found
     */
    public static String getProperty(String key) throws IOException {
        FileInputStream in = new FileInputStream("src/test/resources/properties/config.yml");
        Properties props = new Properties();
        props.load(in);
        return props.getProperty(key);
    }

    /**
     * Gets the value of key from properties file
     *
     * @param key : Key is field for which value need to be fetched
     * @return : returns the String : value of a key
     * @throws IOException : throws exception if file not found
     */
    public static String getQueueProperty(String key) throws IOException {
        FileInputStream in = new FileInputStream("src/test/resources/properties/queues.properties");
        Properties props = new Properties();
        System.out.println(" the key: " + key);
        props.load(in);
        return props.getProperty(key);
    }

    /**
     * Gets the value of key from properties file
     *
     * @param key : Key is field for which value need to be fetched
     * @return : returns the String : value of a key
     * @throws IOException : throws exception if file not found
     */
    public static String getDB2Query(String key) throws IOException {
        FileInputStream in = new FileInputStream("src/test/resources/database/queries.properties");
        Properties props = new Properties();
        System.out.println(" the key: " + key);
        props.load(in);
        return props.getProperty(key);
    }

    /**
     * Gets the value of key from properties file
     *
     * @param key : Key is field for which value need to be fetched
     * @return : returns the String : value of a key
     * @throws IOException : throws exception if file not found
     */
    public static String getCouchbaseQuery(String key) throws IOException {
        FileInputStream in = new FileInputStream("src/test/resources/database/couchbasequeries.properties");
        Properties props = new Properties();
        System.out.println(" the key: " + key);
        props.load(in);
        return props.getProperty(key);
    }



    /**
     * Gets UI environment URL broker information
     *
     * @return : returns the URL based on env
     */
    public static String getUIEnvironment() throws IOException {
        Reporter.logInfo("Getting environment details");
        EnvironmentConfig config = CommonUtils.populateEnvConfig();
        String url = config.getEnv().ui.url;
        return  url;
    }


    public static Document convertStringToXMLDocument(String xmlString) {
        //Parser that produces DOM object trees from XML content
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();

        //API to obtain DOM Document instance
        DocumentBuilder builder = null;
        try
        {
            //Create DocumentBuilder with default configuration
            builder = factory.newDocumentBuilder();

            //Parse the content to Document object
            Document doc = builder.parse(new InputSource(new StringReader(xmlString)));
            return doc;
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        return null;
    }


    public static Document stringToDom(String xmlSource) throws SAXException, ParserConfigurationException, IOException {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new InputSource(new StringReader(xmlSource)));
    }


    public static void writeFile(String stringToConvert, String path) throws IOException {
        BufferedWriter out = new BufferedWriter(new FileWriter(path));
        try {
            out.write(stringToConvert);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            out.close();
        }
    }


    /**
     * Generates a unique message subject.
     * @return	Return the message subject that was generated.
     */
    public static String generateUniqueMessageSubject() {
        String timeStamp = DateHelper.getCurrentDateTimeFormatted("yyyy-MM-ddTHH-mm-ss");
        return "test" + timeStamp;
    }

    /**
     * Generates random string with a limit specified
     * @param minLimit minimum number of letters required to generate a string
     * @param maxLimit maximum number of letters required to generate a string
     * @return returns the random string that is generated
     */
    public static String generateRandomString(int minLimit, int maxLimit) {
        Generex generex = new Generex("[a-z]{"+minLimit +"," + maxLimit +"}");
        // Generate random String
        String randomStr = generex.random();
        System.out.println(randomStr);// a random value from the previous String list
        return randomStr;

    }

    /**
     * This get AMQ queue from config.yml file
     * @param service : This is service that need to passed from a test.
     * @param inboundOrOutboundQueue : This is inbound/outbound queue that need to passed from a test.
     * @return : returns queue name as a String
     */
//    public static String getAmqQueueFromProperties(String service, String inboundOrOutboundQueue) {
//        Reporter.logInfo("Getting environment details");
//        try {
//            String env = System.getProperty("environment");
//            String queue = null;
//            if (env != null && !env.isEmpty()) {
//                Reporter.logInfo("Getting values from terminal file");
//                Reporter.logInfo("The env is : ******" + env);
//                if (inboundOrOutboundQueue.equals("inbound")) {
//                    queue = CommonUtils.getQueueProperty("amq." + service + ".inbound");
//                } else {
//                    queue = CommonUtils.getQueueProperty("amq." + service + ".outbound");
//                }
//                Reporter.logInfo("Getting queue details from commandline");
//                return getService(service).toUpperCase() + "." + queue + "." + getEnv();
//            } else {
//                Reporter.logInfo("Getting values from properties file");
//                if (inboundOrOutboundQueue.equals("inbound")) {
//                    queue = CommonUtils.getQueueProperty("amq." + service + ".inbound");
//                } else {
//                    queue = CommonUtils.getQueueProperty("amq." + service + ".outbound");
//                }
//                Reporter.logInfo("Getting queue details from properties file");
//                return getService(service).toUpperCase() + "." + queue + "." + getEnv();
//            }
//        } catch (IOException e) {
//            Reporter.logError("Unable to get queue name ", e.getMessage());
//            return null;
//        }
//    }

    /**
     * This function gets environment
     * @return : returns ENV based on  input
     */
    public static String getEnv() throws IOException {
        String env = System.getProperty("environment");

        if(env != null && !env.isEmpty()) {
            switch (env) {
                case "integration":
                    return "INT";
                case "release-integration":
                    return "RLS.INT";
                default:
                    return "EPH";
            }
        }
        else
                return "INT";
    }

    /**
     * This splits the String with .
     * @param service : This is service that need to passed from a test.
     * @return : returns name of the Service as a String
     */
    public static String getService(String service) {
        String[] str = service.split("\\.");
        return str[0];
    }

    /**
     * This get AMQ queue from config.yml file
     * @param service : This is service that need to passed from a test.
     * @param inboundOrOutboundQueue : This is inbound/outbound queue that need to passed from a test.
     * @return : returns queue name as a String
     */
//    public static String getAmqQueueForService(String service, String inboundOrOutboundQueue) {
//        Reporter.logInfo("Getting queue details");
//        try {
//            EnvironmentConfig env = populateEnvConfig();
//            String queue = null;
//            String key = null;
//            if (inboundOrOutboundQueue.equals("inbound")) {
//                key = "amq." + service + ".inbound";
//                queue = env.common.queues.get(key);
//            } else {
//                key = "amq." + service + ".outbound";
//                queue = env.common.queues.get(key);
//            }
//            Reporter.logInfo("Getting queue details from yaml for key: " + key);
//            Reporter.logInfo("Queue name from yml file is: " + getService(service).toUpperCase() + "." + queue + "." + getEnv());
//            return getService(service).toUpperCase() + "." + queue + "." + getEnv();
//
//        } catch (IOException e) {
//            Reporter.logError("Unable to get queue name ", e.getMessage());
//            return null;
//        }
//    }



    /**
     * This Loads all values from config.yml file and returns EnvConfig
     * @return
     * @throws IOException
     */
    public static EnvironmentConfig populateEnvConfig(){
        File envConfig = new File("config.yml");
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());

        EnvironmentConfig env = null;
        try {
            env = mapper.readValue(envConfig, EnvironmentConfig.class);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return env;
    }

    public static String getQueueFromConfig(String key) throws IOException {
        EnvironmentConfig env = populateEnvConfig();
        String queue = env.common.queues.get(key);
        Reporter.logInfo("Queue name from config file is: " +  queue);
        return queue;
    }

    public static void writeToSessionStorage(String key, String value) {
        JavascriptExecutor jsExecutor = (JavascriptExecutor) DriverBase.instance;
        jsExecutor.executeScript(
                String.format("window.sessionStorage.setItem('%s','%s')", key, value));
    }

    /**
     * Call this method if you need to round a decimal number to next number,
     * @param number decimal value
     * @return double number rounded by two decimal points
     */
    public static Double roundNumberUp(Double number) {
        BigDecimal bigDecimal = new BigDecimal(Double.toString(number));
        bigDecimal = bigDecimal.setScale(2, RoundingMode.HALF_UP);
        Reporter.logInfo("Rounding number ' " + number + " ' to " + bigDecimal.doubleValue());
        return bigDecimal.doubleValue();
    }

    /**
     * Call this method if you need to get a random number
     * @param maxNumber means up to this number, so it is excluded
     * @return int random number between 0 and the given maxNumber excluded
     */
    public static int getRandomNumber(int maxNumber) {
        Random random = new Random();
        int randomOptionNumber = random.nextInt(maxNumber);
        Reporter.logInfo("Generated Random Number between 0 and " + maxNumber + " = " + randomOptionNumber);
        return randomOptionNumber;
    }

    /**
     * This method is to retrieve the last modified file from given directory
     * @param fileType is the file extension
     * @param directoryPath in which directory the file is found
     * @return the last modified file
     */
    public File getLastModifiedFileFromGivenDirectory(String fileType, String directoryPath){
        File dir = new File(directoryPath);
        File[] allFiles = dir.listFiles();

        ArrayList<File> pdfFiles = new ArrayList<>();
        for (int i = 0; i < allFiles.length; i++) {
            if (allFiles[i].isFile()) {
                String fileName = allFiles[i].getName();
                if (fileName.endsWith("." + fileType.toLowerCase())) {
                    pdfFiles.add(allFiles[i]);
                }
            }
        }

        File lastDownloadedFile = pdfFiles.get(0);
        for (int i = 1; i < pdfFiles.size(); i++) {
            if (lastDownloadedFile.lastModified() < pdfFiles.get(i).lastModified()) {
                lastDownloadedFile = pdfFiles.get(i);
            }
        }
        return lastDownloadedFile;
    }

    /**
     * Use this method to read the content of a PDF file as String
     * @param filePath full path of the file pdf file location
     * @return the pdf content as String
     * @throws IOException
     */
    public String getPdfFileContent(String filePath) throws IOException {
        URL pdfURL = new URL(filePath);
        InputStream is = pdfURL.openStream();
        BufferedInputStream bis = new BufferedInputStream(is);
        PDDocument doc = PDDocument.load(bis);
        PDFTextStripper strip = new PDFTextStripper();
        String pdfContent = strip.getText(doc);
        return pdfContent;
    }

}
