"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.url = exports.transformList = exports.transformFunction = exports.time = exports.resolution = exports.percentage = exports.number = exports.lengthPercentage = exports.length = exports.isCSSType = exports.integer = exports.image = exports.color = exports.angle = exports.Url = exports.TransformList = exports.TransformFunction = exports.Time = exports.Resolution = exports.Percentage = exports.Num = exports.LengthPercentage = exports.Length = exports.Integer = exports.Image = exports.Color = exports.Angle = void 0;
class BaseCSSType {
  constructor(value) {
    this.value = value;
  }
}
const isCSSType = value => {
  return value instanceof BaseCSSType && value.value != null && typeof value.syntax === 'string';
};
exports.isCSSType = isCSSType;
class Angle extends BaseCSSType {
  syntax = '<angle>';
  static syntax = '<angle>';
  static create(value) {
    return new Angle(value);
  }
}
exports.Angle = Angle;
const angle = exports.angle = Angle.create;
class Color extends BaseCSSType {
  syntax = '<color>';
  static create(value) {
    return new Color(value);
  }
}
exports.Color = Color;
const color = exports.color = Color.create;
class Url extends BaseCSSType {
  syntax = '<url>';
  static create(value) {
    return new Url(value);
  }
}
exports.Url = Url;
const url = exports.url = Url.create;
class Image extends Url {
  syntax = '<image>';
  constructor(value) {
    super(value);
    this.value = value;
  }
  static create(value) {
    return new Image(value);
  }
}
exports.Image = Image;
const image = exports.image = Image.create;
class Integer extends BaseCSSType {
  syntax = '<integer>';
  static create(value) {
    return new Integer(convertNumberToStringUsing(String, '0')(value));
  }
}
exports.Integer = Integer;
const integer = exports.integer = Integer.create;
class LengthPercentage extends BaseCSSType {
  syntax = '<length-percentage>';
  static createLength(value) {
    return new LengthPercentage(convertNumberToLength(value));
  }
  static createPercentage(value) {
    return new LengthPercentage(convertNumberToPercentage(value));
  }
}
exports.LengthPercentage = LengthPercentage;
const lengthPercentage = exports.lengthPercentage = LengthPercentage.createLength;
class Length extends LengthPercentage {
  syntax = '<length>';
  static create(value) {
    return new Length(convertNumberToLength(value));
  }
}
exports.Length = Length;
const length = exports.length = Length.create;
class Percentage extends LengthPercentage {
  syntax = '<percentage>';
  static create(value) {
    return new Percentage(convertNumberToPercentage(value));
  }
}
exports.Percentage = Percentage;
const percentage = exports.percentage = Percentage.create;
class Num extends BaseCSSType {
  syntax = '<number>';
  static create(value) {
    return new Num(convertNumberToBareString(value));
  }
}
exports.Num = Num;
const number = exports.number = Num.create;
class Resolution extends BaseCSSType {
  syntax = '<resolution>';
  static create(value) {
    return new Resolution(value);
  }
}
exports.Resolution = Resolution;
const resolution = exports.resolution = Resolution.create;
class Time extends BaseCSSType {
  syntax = '<time>';
  static create(value) {
    return new Time(value);
  }
}
exports.Time = Time;
const time = exports.time = Time.create;
class TransformFunction extends BaseCSSType {
  syntax = '<transform-function>';
  static create(value) {
    return new TransformFunction(value);
  }
}
exports.TransformFunction = TransformFunction;
const transformFunction = exports.transformFunction = TransformFunction.create;
class TransformList extends BaseCSSType {
  syntax = '<transform-list>';
  static create(value) {
    return new TransformList(value);
  }
}
exports.TransformList = TransformList;
const transformList = exports.transformList = TransformList.create;
const convertNumberToStringUsing = (transformNumber, defaultStr) => value => {
  if (typeof value === 'number') {
    return transformNumber(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    const val = value;
    const result = {};
    for (const key of Object.keys(val)) {
      result[key] = convertNumberToStringUsing(transformNumber, defaultStr)(val[key]);
    }
    return result;
  }
  return value;
};
const convertNumberToBareString = convertNumberToStringUsing(value => String(value), '0');
const convertNumberToLength = convertNumberToStringUsing(value => value === 0 ? '0' : `${value}px`, '0px');
const convertNumberToPercentage = convertNumberToStringUsing(value => value === 0 ? '0' : `${value * 100}%`, '0');