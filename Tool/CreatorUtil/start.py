
import sys
import tkinter
from ExcelUtil.ExcelTool import ExcelTool
from PSDTool.PsdTool import PSDTool
from UI.TkGui import TkGui
from Util.cLog import Log
from Util.toolConfig import *


def initUI(ui):
    loadConfig()
    ui.edit_excel_path.insert(tkinter.END,getConfig("表格Excel路径"))
    ui.edit_excel_export_path.insert(tkinter.END,getConfig("导出文件路径"))
    ui.edit_excel_code_path.insert(tkinter.END,getConfig("代码生成路径"))
    ui.edit_psd_path.insert(tkinter.END, getConfig("PSD路径"))


def cmdRun(argv):
    rootPath = "" if argv[1] == None else argv[1]
    filePath = "" if argv[2] == None else argv[2]
    codePath = "" if argv[3] == None else argv[3]
    type = 1 if argv[4] == None else (int)(argv[4])
    Log.ui = None
    tool = ExcelTool(None)

    tool.rootPath = rootPath
    tool.filePath = filePath
    tool.codePath = codePath
    print(rootPath, filePath, codePath, type)
    tool.startExport(type)


if __name__ == '__main__':

    if len(sys.argv) > 1:
        cmdRun(sys.argv)
    else:
        gui = tkinter.Tk()  # 实例化出一个父窗口
        window = TkGui(gui)
        # 设置根窗口默认属性
        window.init_window()

        Log.ui = window
        excelTool = ExcelTool()
        psdTool = PSDTool()
        window.setTool(excelTool, psdTool)
        initUI(window)
        Log.log("欢迎使用")
        gui.mainloop()  # 父窗口进入事件循环，可以理解为保持窗口运行，否则界面不展示
