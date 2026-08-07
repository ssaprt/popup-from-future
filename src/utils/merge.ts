import { CSSProperties, ReactNode } from "react";
import { popupPresets } from "../config/presets";
import { stylesConfig } from "../config/styles-config";
import {
    AnimationDuration,
    GeneralAnimationProps,
    MergedAnimationProps,
    PopupAnimationProps,
} from "../types/animations.type";
import { SizeType } from "../types/general.type";
import {
    PopupBlur,
    PopupCloseRender,
    PopupCloseTimerRender,
    PopupInterface,
} from "../types/popup.interface";

type MergeProps = Pick<
    PopupInterface,
    | "preset"
    | "index"
    | "animation"
    | "layer"
    | "close"
    | "customStyle"
    | "size"
>;

interface MergedStyle {
    style: CSSProperties;
    className: string;
}

export interface MergedPopupConfig {
    index: number;

    animation: {
        open: MergedAnimationProps;
        close: MergedAnimationProps;
    };

    layer: {
        backgroundColor: NonNullable<CSSProperties["backgroundColor"]>;
        blur: `${number}px`;
        style: CSSProperties;
        className: string;
    };

    close: {
        icon?: ReactNode;
        render?: PopupCloseRender;
        timeOutShow?: `${number}ms` | `${number}s`;
        style: CSSProperties;
        className: string;

        timer: {
            render?: PopupCloseTimerRender;
            style: CSSProperties;
            className: string;
        };
    };

    customStyle: {
        container: MergedStyle;
        header: MergedStyle;
        body: MergedStyle;
    };
}

const resolveTime = (
    value: AnimationDuration,
): `${number}ms` | `${number}s` => {
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            return "0ms";
        }

        return `${Math.max(0, value)}ms`;
    }

    return value;
};

const resolveOptionalTime = (
    value?: AnimationDuration,
): `${number}ms` | `${number}s` | undefined => {
    if (value === undefined) {
        return undefined;
    }

    return resolveTime(value);
};

const resolveBlur = (value: PopupBlur): `${number}px` => {
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            return "0px";
        }

        return `${Math.max(0, value)}px`;
    }

    return value;
};

const resolveAnimation = (
    defaults: {
        animationName: MergedAnimationProps["animationName"];
        duration: AnimationDuration;
        easing: MergedAnimationProps["easing"];
    },
    presetAnimation?: PopupAnimationProps,
    presetPhaseAnimation?: GeneralAnimationProps,
    animation?: PopupAnimationProps,
    phaseAnimation?: GeneralAnimationProps,
): MergedAnimationProps => {
    return {
        animationName:
            phaseAnimation?.animationName ??
            animation?.animationName ??
            presetPhaseAnimation?.animationName ??
            presetAnimation?.animationName ??
            defaults.animationName,

        duration: resolveTime(
            phaseAnimation?.duration ??
                animation?.duration ??
                presetPhaseAnimation?.duration ??
                presetAnimation?.duration ??
                defaults.duration,
        ),

        easing:
            phaseAnimation?.easing ??
            animation?.easing ??
            presetPhaseAnimation?.easing ??
            presetAnimation?.easing ??
            defaults.easing,
    };
};

const resolveSize = (
    size?: SizeType,
): Pick<CSSProperties, "width" | "height"> => {
    if (size === undefined) {
        return {};
    }

    if (typeof size === "number") {
        return {
            width: size,
            height: size,
        };
    }

    if (typeof size === "object") {
        return {
            width: size.w,
            height: size.h,
        };
    }

    const [width, height = width] = size.trim().split(/\s+/);

    return {
        width,
        height,
    };
};

const mergeClassNames = (...classNames: Array<string | undefined>): string => {
    return classNames
        .filter((className): className is string => Boolean(className?.trim()))
        .join(" ");
};

export const merge = ({
    preset,
    index,
    animation,
    layer,
    close,
    customStyle,
    size,
}: MergeProps): MergedPopupConfig => {
    const selectedPreset = preset ? popupPresets[preset] : undefined;

    return {
        index: index ?? stylesConfig.index,

        animation: {
            open: resolveAnimation(
                stylesConfig.animation.open,
                selectedPreset?.animation,
                selectedPreset?.animation?.open,
                animation,
                animation?.open,
            ),

            close: resolveAnimation(
                stylesConfig.animation.close,
                selectedPreset?.animation,
                selectedPreset?.animation?.close,
                animation,
                animation?.close,
            ),
        },

        layer: {
            backgroundColor:
                layer?.backgroundColor ??
                selectedPreset?.layer?.backgroundColor ??
                stylesConfig.layer.backgroundColor,

            blur: resolveBlur(
                layer?.blur ??
                    selectedPreset?.layer?.blur ??
                    stylesConfig.layer.blur,
            ),

            style: {
                ...stylesConfig.layer.style,
                ...selectedPreset?.layer?.style,
                ...layer?.style,
            },

            className: mergeClassNames(
                stylesConfig.layer.className,
                selectedPreset?.layer?.className,
                layer?.className,
            ),
        },

        close: {
            icon: close?.icon,

            render: close?.render,

            timeOutShow: resolveOptionalTime(
                close?.timeOutShow ?? stylesConfig.close.timeOutShow,
            ),

            style: {
                ...stylesConfig.close.style,
                ...resolveSize(stylesConfig.close.size),
                ...resolveSize(selectedPreset?.close?.size),
                ...selectedPreset?.close?.style,
                ...resolveSize(close?.size),
                ...close?.style,
            },

            className: mergeClassNames(
                stylesConfig.close.className,
                selectedPreset?.close?.className,
                close?.className,
            ),

            timer: {
                render: close?.timer?.render,

                style: {
                    ...stylesConfig.close.timer.style,
                    ...selectedPreset?.close?.timer?.style,
                    ...close?.timer?.style,
                },

                className: mergeClassNames(
                    stylesConfig.close.timer.className,
                    selectedPreset?.close?.timer?.className,
                    close?.timer?.className,
                ),
            },
        },

        customStyle: {
            container: {
                style: {
                    ...stylesConfig.customStyle.container.style,
                    ...resolveSize(selectedPreset?.size),
                    ...selectedPreset?.customStyle?.container?.style,
                    ...resolveSize(size),
                    ...customStyle?.container?.style,
                },

                className: mergeClassNames(
                    stylesConfig.customStyle.container.className,
                    selectedPreset?.customStyle?.container?.className,
                    customStyle?.container?.className,
                ),
            },

            header: {
                style: {
                    ...stylesConfig.customStyle.header.style,
                    ...selectedPreset?.customStyle?.header?.style,
                    ...customStyle?.header?.style,
                },

                className: mergeClassNames(
                    stylesConfig.customStyle.header.className,
                    selectedPreset?.customStyle?.header?.className,
                    customStyle?.header?.className,
                ),
            },

            body: {
                style: {
                    ...stylesConfig.customStyle.body.style,
                    ...selectedPreset?.customStyle?.body?.style,
                    ...customStyle?.body?.style,
                },

                className: mergeClassNames(
                    stylesConfig.customStyle.body.className,
                    selectedPreset?.customStyle?.body?.className,
                    customStyle?.body?.className,
                ),
            },
        },
    };
};
