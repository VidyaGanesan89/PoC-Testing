package dataprovider;

import environment.EnvironmentConfig;
import utility.CommonUtils;
import utility.Constants;
import org.testng.ITestContext;
import org.testng.annotations.DataProvider;

import java.lang.reflect.Method;
import java.util.Iterator;

public class DataProviderUtils {

	//Data provider for various types of files.. So far for EXCEL, CSV and XML
	@DataProvider(name = "dataprovider")
	public static Iterator<Object[]> genericDataProvider(Method method, ITestContext textContext) throws Exception {
		EnvironmentConfig config = CommonUtils.populateEnvConfig();
		String dataProviderFile = config.common.dataFile;
		
		//Switches based on the file type
		switch (dataProviderFile) {

		case "CSV":
			
			String csvFilePath = Constants.TESTDATA_FILE_PATH + method.getName() + ".csv";
			//Reads the CSV file and return the data
			return ReadCsv.getCsvData(csvFilePath);
			
		case "XML":

			String xmlFilePath = Constants.TESTDATA_FILE_PATH + method.getName() + ".xml";
			//Reads the XML file and return the data
			return ReadXml.getXmlData(xmlFilePath);
			
		case "EXCEL":				
				
			 // String filepath =System.getProperty("user.dir")+"\\TestDataFiles\\";
			  String filepath = Constants.TESTDATA_FILE_PATH + method.getName() + ".xlsx";
			  Iterator<Object[]> ExcelreturnArray = ReadExcel.getExceldata(filepath, "Sheet1");       
			  return (ExcelreturnArray);
			  }

		
		return null;

	}
}