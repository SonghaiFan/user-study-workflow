import { defineStudy } from "../../study/defineStudy";
import { InteractivePlaceholder } from "./InteractivePlaceholder";
import { study } from "./study";

export const plugin = defineStudy({ study, Component: InteractivePlaceholder });
