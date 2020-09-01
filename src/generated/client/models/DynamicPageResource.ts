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
import {
    DynamicPageResourceType,
    DynamicPageResourceTypeFromJSON,
    DynamicPageResourceTypeFromJSONTyped,
    DynamicPageResourceTypeToJSON,
} from './';

/**
 * 
 * @export
 * @interface DynamicPageResource
 */
export interface DynamicPageResource {
    /**
     * 
     * @type {DynamicPageResourceType}
     * @memberof DynamicPageResource
     */
    type?: DynamicPageResourceType;
    /**
     * 
     * @type {object}
     * @memberof DynamicPageResource
     */
    params?: object;
}

export function DynamicPageResourceFromJSON(json: any): DynamicPageResource {
    return DynamicPageResourceFromJSONTyped(json, false);
}

export function DynamicPageResourceFromJSONTyped(json: any, ignoreDiscriminator: boolean): DynamicPageResource {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': !exists(json, 'type') ? undefined : DynamicPageResourceTypeFromJSON(json['type']),
        'params': !exists(json, 'params') ? undefined : json['params'],
    };
}

export function DynamicPageResourceToJSON(value?: DynamicPageResource | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'type': DynamicPageResourceTypeToJSON(value.type),
        'params': value.params,
    };
}

