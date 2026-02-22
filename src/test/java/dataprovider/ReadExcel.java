package dataprovider;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.*;


public class ReadExcel {
	public static XSSFWorkbook wb;
	public static XSSFSheet sheet;
	public static XSSFRow row;
	public static XSSFCell cell;
	 
	public static Iterator<Object[]> getExceldata(String filePath, String Sheetname) throws Exception
	{
		List<Object[]> excelData = new ArrayList<Object[]>();
		String[][] arraydata = null;
		try {
			FileInputStream fs = new FileInputStream(filePath);
			wb= new XSSFWorkbook(fs);
			sheet = wb.getSheet(Sheetname);
			int totalrows = sheet.getLastRowNum();
			int totalCols = sheet.getRow(0).getPhysicalNumberOfCells();
			 arraydata = new String[totalrows][totalCols-1];
			 int k = 0;
			for(int i=1;i<totalrows+1;i++){
				Object[] tokensWithoutFlag = new String[totalCols-1];
				List<Object> list = new ArrayList<Object>();
				if (getCellData(i,0).equals("Y")) {
					for(int j=1;j<totalCols;j++)	{ 
						arraydata[i-1][j-1] = getCellData(i,j);
						list.add(arraydata[i-1][j-1]);
						Object a = arraydata[i-1][j-1];
						tokensWithoutFlag[j-1] = a;					
					}
					excelData.add(k,tokensWithoutFlag);
					k++;
				}
			}	
			
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return excelData.iterator();
	}

	private static String getCellData(int rowNumber, int columnNumber){
		// TODO Auto-generated method stub
		try{
			cell = sheet.getRow(rowNumber).getCell(columnNumber);
			DataFormatter formatter = new DataFormatter(); //creating formatter using the default locale
			String CellData = formatter.formatCellValue(cell); //Returns the formatted value of a cell as a String regardless of the cell type.
			return CellData;
		}
		catch (Exception e)
		{
			System.out.println(e.getMessage());
			throw (e);
		}
	}

	public static List<Object[]> getExcelDataAsList(String filePath, String Sheetname)
	{
		List<Object[]> excelData = new ArrayList<Object[]>();
		String[][] arraydata = null;
		try {
			FileInputStream fs = new FileInputStream(filePath);
			wb= new XSSFWorkbook(fs);
			sheet = wb.getSheet(Sheetname);
			int totalrows = sheet.getLastRowNum();
			int totalCols = sheet.getRow(0).getPhysicalNumberOfCells();
			arraydata = new String[totalrows][totalCols-1];
			int k = 0;
			for(int i=1;i<totalrows+1;i++){
				Object[] tokensWithoutFlag = new String[totalCols-1];
				List<Object> list = new ArrayList<Object>();
				if (getCellData(i,0).equals("Y")) {
					for(int j=1;j<totalCols;j++)	{
						arraydata[i-1][j-1] = getCellData(i,j);
						list.add(arraydata[i-1][j-1]);
						Object a = arraydata[i-1][j-1];
						tokensWithoutFlag[j-1] = a;
					}
					excelData.add(k,tokensWithoutFlag);
					k++;
				}
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return excelData;
	}

	// This method is to write in the Excel cell. File path, Sheet name,  Row num and Col num are the parameters
	public static void setCellData(String excelFilePath,String sheetName, String value, int rowNum, int colNum) {
		try {
			sheet = wb.getSheet(sheetName);
			row = sheet.getRow(rowNum);
			cell = row.getCell(colNum);
			if (cell == null) {
				cell = row.createCell(colNum);
				cell.setCellValue(value);
			} else {
				cell.setCellValue(value);
			}
			// Constant variables Test Data path and Test Data file name
			FileOutputStream fileOut = new FileOutputStream(excelFilePath);
			wb.write(fileOut);
			fileOut.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// This method is based on 3-column format where the first column is for explanation only so not included in the map. Column 2 is for keys and column 3 is for values to be stored in the map.
	public static HashMap<String, String> getExcelDataAsSingleMap(String filePath, String sheetName){
		HashMap<String, String> dataMap = new HashMap<>();

		try {
			FileInputStream fs = new FileInputStream(filePath);
			wb= new XSSFWorkbook(fs);
			sheet = wb.getSheet(sheetName);
			int rowCount = sheet.getLastRowNum();

			for (int rowNum = 1; rowNum <= rowCount; rowNum++) {
				String shortCode = getCellData(rowNum,1);
				String expectedValues = getCellData(rowNum,2);
				dataMap.put(shortCode,expectedValues);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return dataMap;
	}

	// this method converts each row of table into a map and returns a list of map for all the rows in the datasheet
	public static List<HashMap<String, String>> getExcelDataAsListOfMap(String filePath, String sheetName) {
		List<HashMap<String, String>> dataList = new ArrayList<>();
		try {
			FileInputStream fs = new FileInputStream(filePath);
			wb= new XSSFWorkbook(fs);
			sheet = wb.getSheet(sheetName);
			int rowCount = sheet.getLastRowNum();
			int columnCount = sheet.getRow(0).getPhysicalNumberOfCells();

			for (int rowNum = 1; rowNum <= rowCount; rowNum++) {
				LinkedHashMap<String, String> eachRow  = new LinkedHashMap<>();

				for(int columnNum=0; columnNum <= columnCount;  columnNum++){
					String columnHeader = getCellData(0,columnNum);
					String columnValue = getCellData(rowNum,columnNum);
					eachRow.put(columnHeader,columnValue);
				}
				dataList.add(eachRow);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return dataList;
	}

}

	
	


