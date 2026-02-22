package dataprovider;

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;



public class ReadXml {
	public static Iterator<Object[]> getXmlData(String fileName) throws Exception {
		try {			
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			factory.setIgnoringElementContentWhitespace(true);
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document doc = builder.parse(new File(fileName));

			doc.getDocumentElement().normalize();
			//Get TestSet nodes
			NodeList nList = doc.getElementsByTagName("TestSet");			
			List<Object[]> dataList = new ArrayList<Object[]>();
			
			for (int temp = 0; temp < nList.getLength(); temp++) {
				//Array to hold param values from each TestSet			
				List<String> datasetvalue =  new ArrayList<String>();
				
				Node nNode = nList.item(temp);
				
				NamedNodeMap attributeList = nNode.getAttributes();
				if(attributeList.getLength() > 0 && "testrun".equals(attributeList.item(0).getNodeName()) && "Y".equals(attributeList.item(0).getNodeValue())) {
					//Get paramValue nodes
					NodeList paramNodes = nNode.getChildNodes();						
					for (int i = 0; i < paramNodes.getLength(); i++) {
						Node paramNode = paramNodes.item(i);
						//Go inside the if block only if it is an element node. nNode.getChildNodes can potentially return whitespaces as text nodes
						if (paramNode.getNodeType() == Node.ELEMENT_NODE) {
							Element elem = (Element)paramNodes.item(i);
							// Tag name for future reference if needed
					        //String tagName= elem.getTagName();;
					        String tagValue = elem.getTextContent();
					        datasetvalue.add(tagValue);			
						}        
				    }								
					String[] data = new String[datasetvalue.size()];
					int l = 0;
					for (String a :datasetvalue) {
						data[l] = a.toString();
						l++;
					}
					dataList.add(data);				
				}				
			}
			return dataList.iterator();
		} catch (Exception e) {			
			e.printStackTrace();
			throw e;
		}		
	}	
}