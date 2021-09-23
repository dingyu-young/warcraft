# coding=UTF-8
from Util.ioUitl import *
from Util.cLog import Log
from UI.window import Ui_MainWindow
import xlrd
import os.path
import json


class TableInfo:

    def __init__(self):
        self.valueList = []  # 值列表
        self.className = ''  # 类名
        self.keyList = []  # 键列表
        self.typeList = []  # 值类型列表
        self.exportType = 0  # 导出类型
        self.desList = []  # 描述文本列表
        self.xlxsName = ""  # 表格名称
        self.sheetName = ""  # sheet名称

    # 设置键和类型
    def setKeyAndType(self, data):
        for value in data:
            if value == '':
                continue
            list = value.split(":")
            self.keyList.append(list[0])
            self.typeList.append(list[1])

    # 设置值
    def setValue(self, data, value, col):
        if col >= len(self.keyList):
            return
        key = self.keyList[col]
        type = self.typeList[col].capitalize()
        if type == "String":
            value = str(value)
        elif type == "Int":
            value = int(value)
        elif type == "Array":
            value = json.loads(value)
        elif type == "Float":
            value = float(value)
        elif type == "Bool":
            value = int(value)
        data[key] = value
        if col == len(self.keyList) - 1:
            self.valueList.append(data)

    # 获取类型
    def getType(self, index):
        type = self.typeList[index].capitalize()
        if type == "String":
            return "string"
        elif type == "Int":
            return "number"
        elif type == "Array":
            return "[]"
        elif type == "Float":
            return "number"
        elif type == "Bool":
            return "boolean"
        else:
            return self.typeList[index]

    # 获取json格式
    def getJson(self):
        if (self.exportType == 1):
            return None
        key = self.keyList[0]
        data = {}
        for val in self.valueList:
            data[val[key]] = val
        return {self.className: data}

    # 获取文本格式
    def getText(self):
        text = ""
        des = ""
        for i in range(len(self.keyList)):
            key = self.keyList[i] + ":" + self.typeList[i]
            text += (key + "\t")
            des += self.desList[i] + "\t"
        text += "\n"
        text += des + "\n"
        for i in range(len(self.valueList)):
            val = self.valueList[i]
            for key in val:
                text += getJsonStr(val[key]) + "\t"
            text += "\n"
        return text

    # 获取ts代码
    def getTsCode(self):
        txt = ""
        if self.exportType == 1:
            txt += "\nexport enum %s {\n" % (self.className)
            for i in range(len(self.valueList)):
                value = self.valueList[i]
                txt += "\t%s = %d, \t//%s\n" % (value["Enum"], value["Value"], value["Des"])
            txt += '}\n\n'
        else:
            txt = "\n@TableTool.RegirsterTable\n"
            txt += "export class %s extends BaseTable {\n" % (self.className)
            txt += '\tpublic static mName: string = "%s";\n' % (self.className)
            keys = self.keyList
            for i in range(len(keys)):
                type = self.getType(i)
                txt += "\t%s : %s;\t//%s\n" % (keys[i], type, self.desList[i])
            txt += '\tpublic static getConfig(key): %s{\n\t\treturn this.table[key] as %s;\n\t}\n}\n\n' % (
                self.className, self.className)
        return txt

    # 打印函数
    def print(self):
        print(self.className, ":")
        # for val in self.valueList:
        #     print(val)
        # print("")


class ExcelTool:
    ui: Ui_MainWindow  # 界面
    rootPath: str = ""  # excel文件根目录
    filePath: str = ""  # 生成文件路径
    codePath: str = ""  # 代码生成路径
    xlxsList = []  # 生成文件名列表
    fileType = ""  # 生成类型

    def __init__(self, ui: Ui_MainWindow):
        self.ui = ui
        ui.btn_excel.clicked.connect(self.onClick)

    # 处理点击事件
    def onClick(self):
        this = self
        Log.log("开始导出配置表,请勿执行其他操作!!")
        this.xlxsList = []
        this.rootPath = this.ui.edit_excel.toPlainText()  # 表格路径
        this.filePath = this.ui.edit_path.toPlainText()  # 生成文件路径
        this.codePath = this.ui.edit_codepath.toPlainText()  # 代码生成路径
        type = this.ui.comboBox.currentIndex()  # 生成类型
        codeType = "ts"
        configList = this.loadConfigList("ConfigList", "ConfigList")  # 主配置文件
        allConfig = this.loadAllConfig(configList)  # 生成所有的配置列表 [TableInfo]

        try:
            if type < 3:
                this.fileType = "json"
                this.exportToJson(allConfig, type)
            elif type >= 3:
                this.fileType = "txt"
                this.exportToText(allConfig, type)
            this.exportCode(allConfig, codeType)
        except BaseException as e:
            Log.logError("生成表格时错误", e)
        else:
            Log.logSuccess("导出配置表成功")

        return

    # 加载所有配置表
    def loadAllConfig(self, configList: []):
        data = []
        for config in configList:
            xlsxName = config["XLSX"]
            sheetName = config["Sheet"]
            exportType = config["Type"]
            exportName = config["Name"]  # 导出类名
            Des = config["Des"]
            try:
                tableInfo = self.loadExcel(xlsxName, sheetName)
                tableInfo.exportType = 0 if exportType == "" else exportType
                tableInfo.className = exportName
                tableInfo.xlxsName = xlsxName
                tableInfo.sheetName = sheetName
                tableInfo.print()
                data.append(tableInfo)
            except ValueError as err:
                Log.logError(xlsxName, "读取分页", sheetName, "出错")
                print(err)
                pass
            except TypeError as err:
                Log.logError(xlsxName, "分页:", sheetName, "Json解析出错")
                print(err)
        return data

    # 加载主配置表格
    def loadConfigList(self, xlslname: str, sheetName: str):
        path = r"" + self.rootPath + "\\" + xlslname + ".xlsx"
        if not os.path.isfile(path):  # 检测文件是否存在
            Log.logError("不存在主配置表", xlslname)
            return

        wb = xlrd.open_workbook(path)  # 打开Excel文件
        if sheetName not in wb._sheet_names:  # 检测sheet分页是否存在
            Log.logError("主配置表", xlslname, "不存在分页:", sheetName)
            return

        sheet = wb.sheet_by_name(sheetName)  # 通过excel表格名称(rank)获取工作表
        dataList = []
        keyList = []

        for row in range(sheet.nrows):  # 循环读取表格内容
            if row == 1:
                continue
            cells = sheet.row_values(row)  # 读取一行数据  内容[id:int,xlsl:string]
            data = {}
            for col in range(len(cells)):
                value = cells[col]
                if row == 0:
                    keyList.append(value.split(":")[0])
                else:
                    cellType = sheet.cell(row, col).ctype
                    if value != '' and cellType == 2 and value % 1 == 0.0:  # 是整数
                        value = int(value)
                    data[keyList[col]] = value
            if row != 0:
                dataList.append(data)  # 把每次循环读取的数据插入到list
        return dataList

    #  加载主配置里的所有表格
    def loadExcel(self, xlslName: str, sheetName: str):
        path = r"" + self.rootPath + "\\" + xlslName + ".xlsx"
        if not os.path.isfile(path):  # 检测文件是否存在
            Log.logError("不存在配置表", xlslName)
            return

        wb = xlrd.open_workbook(path)  # 打开Excel文件
        if sheetName not in wb._sheet_names:  # 检测sheet分页是否存在
            Log.logError("配置表", xlslName, "不存在分页:", sheetName)
            return

        sheet = wb.sheet_by_name(sheetName)  # 通过excel表格名称(rank)获取工作表

        tableInfo = TableInfo()
        for row in range(sheet.nrows):  # 循环读取表格内容
            cells = sheet.row_values(row)  # 读取一行数据  内容[id:int,xlsl:string]

            if row == 1:
                tableInfo.desList = cells
                continue
            if row == 0:
                tableInfo.setKeyAndType(cells)
                continue

            data = {}
            for col in range(len(cells)):
                if col > len(tableInfo.keyList):
                    break
                value = cells[col]
                cellType = sheet.cell(row, col).ctype
                if cellType == 2 and value % 1 == 0.0:  # 是整数
                    value = int(value)
                try:
                    tableInfo.setValue(data, value, col)
                except BaseException as e:
                    Log.logError("Json解析失败或属性字段错误:", xlslName, sheetName)
        return tableInfo

    #  导出json
    def exportToJson(self, data: [], type):
        jsonObj = {}
        for value in data:
            jsonVal = value.getJson()
            if jsonVal != None:
                if type == 0:  # 所有都放在一个json中
                    jsonObj[value.className] = jsonVal[value.className]
                elif type == 2:  # 每一个sheet单独一个josn
                    self.xlxsList.append(value.className)
                    writeToFile(getJsonStr(jsonVal), self.filePath, value.className, "json")
                elif type == 1:  # 同一个文件内的表放在一个json中
                    if value.xlxsName not in jsonObj:
                        jsonObj[value.xlxsName] = {}
                    jsonObj[value.xlxsName][value.className] = jsonVal[value.className]

        if type == 0:
            self.xlxsList = ["allconfig"]
            writeToFile(getJsonStr(jsonObj), self.filePath, "allconfig", "json")
        elif type == 1:
            for xlxs in jsonObj:
                fileName = getEnglish(xlxs)
                self.xlxsList.append(fileName)
                writeToFile(getJsonStr(jsonObj[xlxs]), self.filePath, fileName, "json")
        return

    #  导出文本格式
    def exportToText(self, data: [], type):
        if type == 5:
            for value in data:
                if value.exportType == 1:
                    continue
                text = "##" + value.className + "\n"
                text += value.getText()
                self.xlxsList.append(value.className)
                writeToFile(text, self.filePath, value.className, "txt")
            return

        if type == 3:
            text = ""
            for value in data:
                if value.exportType == 1:
                    continue
                text += "##" + value.className + "\n"
                text += value.getText()
            self.xlxsList = ["allconfig"]
            writeToFile(text, self.filePath, "allconfig", "txt")
            return

        if type == 4:
            dict = {}
            for value in data:
                if value.exportType == 1:
                    continue
                if value.xlxsName not in dict:
                    dict[value.xlxsName] = {}
                dict[value.xlxsName][value.className] = value
            for key1 in dict:
                text = ""
                xlxs = dict[key1]
                for key2 in xlxs:
                    value = xlxs[key2]
                    text += "##" + value.className + "\n"
                    text += value.getText()
                fileName = getEnglish(key1)
                self.xlxsList.append(fileName)
                writeToFile(text, self.filePath, fileName, "txt")
            return

    # 导出代码
    def exportCode(self, data, type):
        if type == "ts":
            text = "enum EnumTableType {\n\tjson = 1,\n\ttxt = 2,\n}\n"
            text += "var xlsxList = " + json.dumps(self.xlxsList) + ";\n"
            text += "var tableType = EnumTableType.%s;\n\n" % (self.fileType)
            text += readTemplate("ts.txt")
            for val in data:
                text += val.getTsCode()
            writeToFile(text, self.codePath, "TableConfig", "ts")
