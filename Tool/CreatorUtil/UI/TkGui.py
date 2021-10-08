# -*- coding: utf-8 -*-
import _thread
from tkinter import *
from tkinter import ttk

LOG_LINE_NUM = 0


class TkGui:
    def __init__(self, tk):
        self.tk = tk

    def setTool(self, exceltool, psdtool):
        self.excelTool = exceltool
        self.psdTool = psdtool

    # 设置窗口
    def init_window(self):
        self.tk.title("Creator工具_dy_v1.0")  # 窗口名
        # self.tk.geometry('320x160+10+10')                         #290 160为窗口大小，+10 +10 定义窗口弹出时的默认展示位置
        self.tk.geometry('1068x681')
        self.init_log()
        self.init_excle()
        self.init_psd()

    def init_log(self):
        y = 400
        Label(self.tk, text="日志").place(x=10, y=y)
        self.label_log = Text(self.tk, width=140, height=15)  # 处理结果展示
        self.label_log.place(x=10, y=y + 30)

    def init_excle(self):
        # excel
        spacY = 50
        startY = 20
        startX = 100
        textList = ["表格路径", "生成路径", "代码路径", "导出格式"]
        for i in range(len(textList)):
            Label(self.tk, text=textList[i], font=24).place(x=startX - 80, y=startY + spacY * i)
        self.edit_excel_path = Text(self.tk, width=30, height=2)  # 原始数据录入框
        self.edit_excel_export_path = Text(self.tk, width=30, height=2)  # 处理结果展示
        self.edit_excel_code_path = Text(self.tk, width=30, height=2)  # 处理结果展示
        self.edit_excel_type = ttk.Combobox(self.tk, state='readonly')  # 导出类型
        self.edit_excel_type["values"] = (
            'Json:只导出一份', 'Json:一张xlsx导出一份', 'Json:每个类一份', 'Txt:只导出一份', "Txt:一张xlsx导出一份", "Txt:每个类一份")
        self.edit_excel_type.current(1)

        self.edit_excel_path.place(x=startX, y=startY)
        self.edit_excel_export_path.place(x=startX, y=startY + spacY * 1)
        self.edit_excel_code_path.place(x=startX, y=startY + spacY * 2)
        self.edit_excel_type.place(x=startX, y=startY + spacY * 3)

        self.btn_excel = Button(self.tk, text="导出表格", bg="AliceBlue", width=10,
                                command=self.onClickExcel)  # 调用内部方法  加()为直接调用
        self.btn_excel.place(x=startX - 80, y=startY + spacY * 4)

    def init_psd(self):
        # psd
        spacY = 50
        startY = 20
        startX = 600
        textList = ["PSD根目录", "PSD名称", "导出配置"]
        for i in range(len(textList)):
            Label(self.tk, text=textList[i], font=24).place(x=startX - 80, y=startY + spacY * i)
        self.edit_psd_path = Text(self.tk, width=30, height=2)  # 原始数据录入框
        self.edit_psd_name = Text(self.tk, width=30, height=2)  # 处理结果展示
        self.edit_psd_type = ttk.Combobox(self.tk, state='readonly')  # 导出类型
        self.edit_psd_type["values"] = ("不导出隐藏图层", "全部导出")
        self.edit_psd_type.current(0)

        self.edit_psd_path.place(x=startX, y=startY)
        self.edit_psd_name.place(x=startX, y=startY + spacY * 1)
        self.edit_psd_type.place(x=startX, y=startY + spacY * 2)

        self.btn_psd = Button(self.tk, text="导出PSD", bg="AliceBlue", width=10,
                              command=self.onClickPsd)  # 调用内部方法  加()为直接调用
        self.btn_psd.place(x=startX - 80, y=startY + spacY * 3)

    def onClickExcel(self):
        rootPath = self.edit_excel_path.get("0.0", "end").replace("\n", "")  # 表格路径
        filePath = self.edit_excel_export_path.get("0.0", "end").replace("\n", "")  # 生成文件路径
        codePath = self.edit_excel_code_path.get("0.0", "end").replace("\n", "")  # 代码生成路径
        type = self.edit_excel_type.current()  # 生成类型
        try:
            _thread.start_new_thread(self.excelTool.onClick, (rootPath, filePath, codePath, type))
        except:
            self.addLog("Error: 表格导出失败,请重试", "red")
        # self.excelTool.onClick(rootPath, filePath, codePath, type)

    def onClickPsd(self):
        path = self.edit_psd_path.get("0.0", "end").replace("\n", "")  # 表格路径
        name = self.edit_psd_name.get("0.0", "end").replace("\n", "")  # 生成文件路径
        type = self.edit_psd_type.current()  # 生成类型
        try:
            _thread.start_new_thread(self.psdTool.onClick, (path, name, type))
        except:
            self.addLog("Error: PSD导出失败,请重试", "red")
        # self.psdTool.onClick(path, name, type)
        return

    def addLog(self, msg, color):
        global LOG_LINE_NUM
        tag = ""
        if color != "":  # 添加文本标签颜色
            tag = "tags_%s" % (LOG_LINE_NUM)
            self.label_log.tag_add(tag, '%f' % LOG_LINE_NUM)
            self.label_log.tag_config(tag, foreground=color)
        if LOG_LINE_NUM <= 15:
            self.label_log.insert(END, msg, tag)
            LOG_LINE_NUM = LOG_LINE_NUM + 1
        else:
            self.label_log.delete(0.0, END)
            self.label_log.insert(END, msg, tag)
            LOG_LINE_NUM = 1

#
# def gui_start():
#     window = Tk()  # 实例化出一个父窗口
#     ZMJ_PORTAL = TkGui(window)
#     # 设置根窗口默认属性
#     ZMJ_PORTAL.init_window()
#
#     window.mainloop()  # 父窗口进入事件循环，可以理解为保持窗口运行，否则界面不展示
#
#
# if __name__ == '__main__':
#     gui_start()
