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

const resolveSizeVars = (
    size: SizeType | undefined,
    prefix: string,
): CSSProperties => {
    if (size === undefined) {
        return {};
    }

    let width: string | number;
    let height: string | number;

    if (typeof size === "number") {
        width = size;
        height = size;
    } else if (typeof size === "object") {
        width = size.w;
        height = size.h;
    } else {
        const [w, h = w] = size.trim().split(/\s+/);
        width = w;
        height = h;
    }

    return {
        [`${prefix}-width`]: String(width),
        [`${prefix}-height`]: String(height),
    } as CSSProperties;
};

const mergeClassNames = (...classNames: Array<string | undefined>): string => {
    return classNames
        .filter((className): className is string => Boolean(className?.trim()))
        .join(" ");
};

/**
 * Extracts themeable properties from a style object and maps them onto
 * CSS custom properties. By applying theme values through CSS variables
 * (consumed inside `:where()` rules with zero specificity), a consumer's
 * `className` can override them without `!important`.
 */
const toThemeVars = (
    style: CSSProperties | undefined,
    prefix: string,
): CSSProperties => {
    if (!style) {
        return {};
    }

    const keyMap: Array<[keyof CSSProperties, string]> = [
        ["color", `${prefix}-color`],
        ["background", `${prefix}-background`],
        ["border", `${prefix}-border`],
        ["borderRadius", `${prefix}-border-radius`],
        ["boxShadow", `${prefix}-box-shadow`],
        ["fontFamily", `${prefix}-font-family`],
        ["backdropFilter", `${prefix}-backdrop-filter`],
        ["WebkitBackdropFilter", `${prefix}-webkit-backdrop-filter`],
    ];

    const vars: Record<string, string> = {};

    for (const [key, varName] of keyMap) {
        const value = style[key];

        if (value !== undefined) {
            vars[varName] = String(value);
        }
    }

    return vars;
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

    const presetContainerStyle = selectedPreset?.customStyle?.container?.style;
    const presetHeaderStyle = selectedPreset?.customStyle?.header?.style;
    const presetBodyStyle = selectedPreset?.customStyle?.body?.style;
    const presetCloseStyle = selectedPreset?.close?.style;
    const presetCloseTimerStyle = selectedPreset?.close?.timer?.style;

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

            style: layer?.style ?? {},

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
                ...toThemeVars(presetCloseStyle, "--ssaprt-popup-close"),
                ...resolveSizeVars(
                    selectedPreset?.close?.size,
                    "--ssaprt-popup-close",
                ),
                ...resolveSizeVars(close?.size, "--ssaprt-popup-close"),
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
                    ...toThemeVars(
                        presetCloseTimerStyle,
                        "--ssaprt-popup-close-timer",
                    ),
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
                    ...toThemeVars(
                        presetContainerStyle,
                        "--ssaprt-popup-container",
                    ),
                    ...resolveSizeVars(
                        selectedPreset?.size,
                        "--ssaprt-popup-container",
                    ),
                    ...resolveSizeVars(size, "--ssaprt-popup-container"),
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
                    ...toThemeVars(presetHeaderStyle, "--ssaprt-popup-header"),
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
                    ...toThemeVars(presetBodyStyle, "--ssaprt-popup-body"),
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
