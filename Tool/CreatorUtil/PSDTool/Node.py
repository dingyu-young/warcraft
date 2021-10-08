class PSDInfo:
    width: int = 720
    height: int = 1280


class Node:
    type = ''  # 类型
    name = ''  # 节点名
    src = ''  # 图片名或文本内容
    fontsize: str  # 字体大小
    pos: tuple  # 位置
    size: tuple  # 大小
    opacity = 255  # 透明度

    def __init__(self, data):
        if data == None:
            self.type = "cc.Sprite"
            self.src = "exportpsd"
            self.name = "exportpsd"
            self.pos = (-720, 0)
            self.size = (PSDInfo.width, PSDInfo.height)
            return
        self.initData(data)

    def initData(self, data):
        type = data.kind
        if type == "group":
            self.type = "cc.Node"
            return
        elif type == "type":  # 文本
            self.type = "cc.Label"
            self.src = data.text
            font = data.engine_dict['StyleRun']['RunArray'][0]['StyleSheet']['StyleSheetData']["FontSize"]
            self.fontsize = str(font)
        elif type == "pixel" or type == "smartobject" or type == "shape":  # 图片
            self.type = "cc.Sprite"
            self.src = data.name
        self.pos = self.getPos(data)
        self.size = data.size
        self.name = data.name
        self.opacity = data.opacity

    def getJson(self):
        data = {}
        data["type"] = self.type
        data["name"] = self.name
        data["src"] = self.src
        data["pos"] = self.pos
        data["size"] = self.size
        if data["type"] == "cc.Label":
            data["fontsize"] = self.fontsize
        return data

    def getPos(self, data):
        # ps是以左上角为原点
        bbox = data.bbox
        cx = PSDInfo.width / 2  # 360
        cy = PSDInfo.height / 2  # 640
        nx = bbox[0] + data.width / 2
        ny = bbox[1] + data.height / 2
        x = nx - cx
        y = cy - ny
        return (x, y)
