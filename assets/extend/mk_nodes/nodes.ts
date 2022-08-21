import { EDITOR } from "cc/env";
import * as cc from "cc";

declare module "cc" {
	interface Node {
		/**节点排列次序 */
		zIndex: number;
	}
	interface Node {
		label: Label;
		mask: Mask;
		render_root_2d: RenderRoot2D;
		rich_text: RichText;
		sprite: Sprite;
		animation: Animation;
		rigid_body: RigidBody;
		rigid_body_2d: RigidBody2D;
		button: Button;
		canvas: Canvas;
		edit_box: EditBox;
		label_outline: LabelOutline;
		label_shadow: LabelShadow;
		layout: Layout;
		page_view: PageView;
		progress_bar: ProgressBar;
		safe_area: SafeArea;
		scroll_bar: ScrollBar;
		scroll_view: ScrollView;
		slider: Slider;
		toggle: Toggle;
		toggle_container: ToggleContainer;
		ui_opacity: UIOpacity;
		ui_transform: UITransform;
		widget: Widget;
	}
}

if (!EDITOR) {
	const component_ss = {
		label: "cc.Label",
		mask: "cc.Mask",
		render_root_2d: "cc.RenderRoot2D",
		rich_text: "cc.RichText",
		sprite: "cc.Sprite",
		animation: "cc.Animation",
		rigid_body: "cc.RigidBody",
		rigid_body_2d: "cc.RigidBody2D",
		button: "cc.Button",
		canvas: "cc.Canvas",
		edit_box: "cc.EditBox",
		label_outline: "cc.LabelOutline",
		label_shadow: "cc.LabelShadow",
		layout: "cc.Layout",
		page_view: "cc.PageView",
		progress_bar: "cc.ProgressBar",
		safe_area: "cc.SafeArea",
		scroll_bar: "cc.ScrollBar",
		scroll_view: "cc.ScrollView",
		slider: "cc.Slider",
		toggle: "cc.Toggle",
		toggle_container: "cc.ToggleContainer",
		ui_opacity: "cc.UIOpacity",
		ui_transform: "cc.UITransform",
		widget: "cc.Widget",
	};
	/* --------------- 准备参数 --------------- */
	// 重载组件读/写
	for (let k_s in component_ss) {
		let component_tab: { [k: string]: cc.Component | null } = cc.js.createMap();
		Object.defineProperty(cc.Node.prototype, k_s, {
			get: function (this: cc.Node) {
				if (component_tab[this.uuid]?.isValid) {
					return component_tab[this.uuid];
				}
				return (component_tab[this.uuid] =
					this.getComponent(component_ss[k_s]) || this.addComponent(component_ss[k_s]));
			},
			configurable: true,
		});
	}
	// zIndex
	Object.defineProperty(cc.Node.prototype, "zIndex", {
		get: function () {
			return (
				this.getComponent(cc.UITransformComponent) ||
				this.addComponent(cc.UITransformComponent)
			).priority;
		},
		set: function (value_n_) {
			(
				this.getComponent(cc.UITransformComponent) ||
				this.addComponent(cc.UITransformComponent)
			).priority = value_n_;
		},
		configurable: true,
	});
}
