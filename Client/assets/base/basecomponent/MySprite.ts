import disallowMultiple = cc._decorator.disallowMultiple;
import requireComponent = cc._decorator.requireComponent;
import ccclass = cc._decorator.ccclass;
import menu = cc._decorator.menu;
import property = cc._decorator.property;


@ccclass
@disallowMultiple()
@menu('自定义组件/MySprite')
@requireComponent(cc.Sprite)
export class MySprite extends cc.Component{

    sprite:cc.Sprite;

    @property({
        tooltip:"图片",
        type:[cc.SpriteFrame]
    })
    private sprites:cc.SpriteFrame[] = [null,null];

    @property({
        tooltip:"图片名称",
        type:[cc.String]
    })
    private names:string[] = ["",""];

}