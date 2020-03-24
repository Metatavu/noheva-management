/* tslint:disable */
/* eslint-disable */
/**
 * Muisti API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * Describes device model physical dimensions
 * @export
 * @interface DeviceModelDimensions
 */
export interface DeviceModelDimensions {
    /**
     * 
     * @type {number}
     * @memberof DeviceModelDimensions
     */
    width?: number;
    /**
     * 
     * @type {number}
     * @memberof DeviceModelDimensions
     */
    height?: number;
}

export function DeviceModelDimensionsFromJSON(json: any): DeviceModelDimensions {
    return DeviceModelDimensionsFromJSONTyped(json, false);
}

export function DeviceModelDimensionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): DeviceModelDimensions {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'width': !exists(json, 'width') ? undefined : json['width'],
        'height': !exists(json, 'height') ? undefined : json['height'],
    };
}

export function DeviceModelDimensionsToJSON(value?: DeviceModelDimensions | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'width': value.width,
        'height': value.height,
    };
}


