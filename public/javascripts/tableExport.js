/*The MIT License (MIT)

Copyright (c) 2014 https://github.com/kayalshri/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

(function($){
    $.fn.extend({
        tableExport: function(options) {
            var defaults = {
                    separator: ',',
                    ignoreColumn: [],
                    tableName:'yourTableName',
                    type:'csv',
                    pdfFontSize:14,
                    pdfLeftMargin:20,
                    escape:'true',
                    htmlContent:'false',
                    consoleLog:'false'
            };

            var options = $.extend(defaults, options);
            var el = this;

            function download(filename, text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            }


            if(defaults.type == 'csv' || defaults.type == 'txt'){
                // Header
                var tdData ="";
                $(el).find('thead').find('tr').each(function() {
                tdData += "\n";					
                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                tdData += '"' + parseString($(this)) + '"' + defaults.separator;
                            }
                        }

                    });
                    tdData = $.trim(tdData);
                    tdData = $.trim(tdData).substring(0, tdData.length -1);
                });

                $(el).find('tbody').find('tr').each(function() {
                tdData += "\n";
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                tdData += '"'+ parseString($(this)) + '"'+ defaults.separator;
                            }
                        }
                    });
                    tdData = $.trim(tdData).substring(0, tdData.length -1);
                });

                if(defaults.consoleLog == 'true'){
                    console.log(tdData);
                }
                var base64data = "base64," + $.base64.encode(tdData);
                window.open('data:application/'+defaults.type+';filename=exportData;' + base64data);
            }else if(defaults.type == 'sql'){
                var tdData ="INSERT INTO `"+defaults.tableName+"`\n(";
                $(el).find('thead').find('tr').each(function() {

                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                tdData += '`' + parseString($(this)) + '`,' ;
                            }
                        }

                    });
                    tdData = $.trim(tdData);
                    tdData = $.trim(tdData).substring(0, tdData.length -1);
                });
                tdData += ")\nVALUES ";
                var n=0;
                $(el).find('tbody').find('tr').each(function() {
                    n++;
                });
                var f = true;
                console.log(n);
                // Row vs Column
                $(el).find('tbody').find('tr').each(function() {
                    n--;
                    f=false;
                tdData += "(";
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                tdData += '"'+ parseString($(this)) + '",';
                                if(n==0 && f)
                                    console.log(n);
                            }
                        }
                    });

                    tdData = $.trim(tdData).substring(0, tdData.length -1);
                    tdData += "),\n";
                });
                tdData = $.trim(tdData).substring(0, tdData.length -1);
                tdData += ";";
                var str = tdData.replace(",;",";");

                if(defaults.consoleLog == 'true'){
                    console.log(tdData);
                }

                download(defaults.tableName+'.sql',str);

            }else if(defaults.type == 'json'){
                var jsonHeaderArray = [];
                $(el).find('thead').find('tr').each(function() {
                    var tdData ="";
                    var jsonArrayTd = [];

                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                jsonArrayTd.push(parseString($(this)));
                            }
                        }
                    });
                    jsonHeaderArray.push(jsonArrayTd);
                });

                var jsonArray = [];
                $(el).find('tbody').find('tr').each(function() {
                    var tdData ="";
                    var jsonArrayTd = [];

                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                jsonArrayTd.push(parseString($(this)));
                            }
                        }
                    });
                    jsonArray.push(jsonArrayTd);

                });

                var jsonExportArray =[];
                jsonExportArray.push({header:jsonHeaderArray,data:jsonArray});
                //Return as JSON
                //console.log(JSON.stringify(jsonExportArray));

                //Return as Array
                //console.log(jsonExportArray);
                if(defaults.consoleLog == 'true'){
                    console.log(JSON.stringify(jsonExportArray));
                }
                var base64data = "base64," + $.base64.encode(JSON.stringify(jsonExportArray));
                window.open('data:application/json;filename=exportData;' + base64data);
            }else if(defaults.type == 'xml'){

                var xml = '<?xml version="1.0" encoding="utf-8"?>'+'\n';
                xml += '<tabledata>'+'\n'+'<fields>'+'\n';

                // Header
                $(el).find('thead').find('tr').each(function() {
                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                xml += "<field>" + parseString($(this)) + "</field>"+'\n';
                            }
                        }
                    });
                });
                xml += '</fields>'+'\n'+'<data>'+'\n';

                // Row Vs Column
                var rowCount=1;
                $(el).find('tbody').find('tr').each(function() {
                    xml += '<row id="'+rowCount+'">'+'\n';
                    var colCount=0;
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                xml += "<column-"+colCount+">"+parseString($(this))+"</column-"+colCount+">"+'\n';
                            }
                        }
                        colCount++;
                    });
                    rowCount++;
                    xml += '</row>'+'\n';
                });
                xml += '</data>'+'\n'+'</tabledata>'+'\n';

                if(defaults.consoleLog == 'true'){
                    console.log(xml);
                }
                var base64data = "base64," + $.base64.encode(xml);
                download(defaults.tableName+'.xml',xml);
            }
            else if(defaults.type == 'excel' || defaults.type == 'doc' || defaults.type == 'powerpoint'){
                var excel="<table>";
                $(el).find('thead').find('tr').each(function() {
                    excel += "<tr>";
                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                excel += "<td>" + parseString($(this))+ "</td>";
                            }
                        }
                    });
                    excel += '</tr>';
                });


                var rowCount=1;
                $(el).find('tbody').find('tr').each(function() {
                    excel += "<tr>";
                    var colCount=0;
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                excel += "<td>"+parseString($(this))+"</td>";
                            }
                        }
                        colCount++;
                    });
                    rowCount++;
                    excel += '</tr>';
                });
                excel += '</table>';
                if(defaults.consoleLog == 'true'){
                    console.log(excel);
                }

                var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+defaults.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
                excelFile += "<head>";
                excelFile += "<!--[if gte mso 9]>";
                excelFile += "<xml>";
                excelFile += "<x:ExcelWorkbook>";
                excelFile += "<x:ExcelWorksheets>";
                excelFile += "<x:ExcelWorksheet>";
                excelFile += "<x:Name>";
                excelFile += "{worksheet}";
                excelFile += "</x:Name>";
                excelFile += "<x:WorksheetOptions>";
                excelFile += "<x:DisplayGridlines/>";
                excelFile += "</x:WorksheetOptions>";
                excelFile += "</x:ExcelWorksheet>";
                excelFile += "</x:ExcelWorksheets>";
                excelFile += "</x:ExcelWorkbook>";
                excelFile += "</xml>";
                excelFile += "<![endif]-->";
                excelFile += "</head>";
                excelFile += "<body>";
                excelFile += excel;
                excelFile += "</body>";
                excelFile += "</html>";
                var base64data = "base64," + $.base64.encode(excelFile);
                if(defaults.type==="doc")
                    download(defaults.tableName+'.'+defaults.type,excelFile);
                else if(defaults.type==="excel")
                    download(defaults.tableName+'.xls',excelFile);
            }else if(defaults.type == 'png'){
                var getCanvas;
                html2canvas($(el), {
                    onrendered: function (canvas) {
                           getCanvas = canvas;
                           var imgageData = getCanvas.toDataURL("image/png");
                           var newData = imgageData.replace(/^data:image\/png/,"data:application/octet-stream");
                           $("#png").attr("download",defaults.tableName+".png").attr("href", newData);
                        }
                });
            }else if(defaults.type == 'pdf'){

                var doc = new jsPDF('p','pt', 'a4', true);
                doc.setFontSize(defaults.pdfFontSize);
                
                // Header
                var startColPosition=defaults.pdfLeftMargin;
                $(el).find('thead').find('tr').each(function() {
                    $(this).filter(':visible').find('th').each(function(index,data) {
                        if ($(this).css('display') != 'none'){					
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                var colPosition = startColPosition+ (index * 50);									
                                doc.text(colPosition,20, parseString($(this)));
                            }
                        }
                    });									
                });					
            
            
                // Row Vs Column
                var startRowPosition = 20; var page =1;var rowPosition=0;
                $(el).find('tbody').find('tr').each(function(index,data) {
                    rowCalc = index+1;
                    
                if (rowCalc % 26 == 0){
                    doc.addPage();
                    page++;
                    startRowPosition=startRowPosition+10;
                }
                rowPosition=(startRowPosition + (rowCalc * 10)) - ((page -1) * 280);
                    
                    $(this).filter(':visible').find('td').each(function(index,data) {
                        if ($(this).css('display') != 'none'){	
                            if(defaults.ignoreColumn.indexOf(index) == -1){
                                var colPosition = startColPosition+ (index * 50);									
                                doc.text(colPosition,rowPosition, parseString($(this)));
                            }
                        }
                        
                    });															
                    
                });					
                                    
                // Output as Data URI
                doc.output('datauri');

            }
            
            
            function parseString(data){
            
                if(defaults.htmlContent == 'true'){
                    content_data = data.html().trim();
                }else{
                    content_data = data.text().trim();
                }
                if(defaults.escape == 'true'){
                    content_data = escape(content_data);
                }
                return content_data;
            }
        }
    });
})(jQuery);