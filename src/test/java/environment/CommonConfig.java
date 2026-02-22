package environment;

import java.util.List;
import java.util.Map;

public class CommonConfig {
    public String dataFile;
    public String browser;
    public String waitTime;
    public String proxyUrl;
    public String bearerToken;
    public Map<String, String> services;
    public Map<String, String> queues;
    public boolean emailAfterTestRun;
    public String senderEmail;
    public String senderPassword;
    public String emailRecipients;
    public String proxyUsername;
    public String proxyPassword;
    public String defaultEnvironment;
    public String azureBaseUrl;   // ADO Integration - added to store Azure Base URI for Azure Rest APIs
    public String azureToken;     // ADO Integration - added to store Azure Personal Access token for accessing Azure
    public String azureTestPlanId; // ADO Integration - added to store Azure Test Plan ID for Azure Test Runs
    public List<String> azureTestSuiteIds; // ADO Integration - added to store Azure Test Suite Ids for creating an Azure Test Run

}


