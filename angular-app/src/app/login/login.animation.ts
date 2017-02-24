import { trigger, state, style, transition, animate } from "@angular/core";

export const LoaderAnimation = trigger("loader", [
  state("load", style({
    "min-width": "40px",
    "width": "40px",
    "border-radius": "50%",
  })),
  state("noLoad", style({
    "min-width": "100%",
    "width": "100%",
    "border-radius": "*",
  })),
  state("success", style({
    position: "relative",
    top: "-530px",
    right: "830px",
    width: "100vw",
    height: "100vh",
    opacity: 0.1,
  })),
  transition("* => *", animate("300ms ease-in")),
]);

export const PaddingTopEnlargeAnimation = trigger("paddingTopEnlarge", [
  state("enlarged", style({
    "padding-top": "20px",
    "margin-top": "-20px",
  })),
  state("normal", style({
    "padding-top": "10px",
    "margin-top": "-15px",
  })),
  transition("normal => enlarged", animate("300ms ease-in")),
  transition("enlarged => normal", animate("300ms ease-out")),
]);

export const WidthEnlargeAnimation = trigger("widthEnlarge", [
  state("enlarged", style({
    "width": "100%",
  })),
  state("normal", style({
    "width": "40px"
  })),
  transition("normal => enlarged", animate("300ms ease-in")),
  transition("enlarged => normal", animate("300ms ease-out")),
]);

export const FadeAnimation = trigger("fade", [
  state("active", style({
    "opacity": 1,
  })),
  state("inactive", style({
    "opacity": 0.1,
  })),
  state("hide", style({
    "opacity": 0,
  })),
  transition("active => inactive", animate("300ms ease-out")),
  transition("inactive => active", animate("300ms ease-in")),
  transition("active => hide", animate("300ms ease-out")),
  transition("hide => active", animate("300ms ease-in")),
]);

export const LoginAnimations = [
  LoaderAnimation,
  FadeAnimation,
  PaddingTopEnlargeAnimation,
  WidthEnlargeAnimation
];