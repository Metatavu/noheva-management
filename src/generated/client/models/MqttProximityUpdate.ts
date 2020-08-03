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
 * MQTT message about tag proximity
 * @export
 * @interface MqttProximityUpdate
 */
export interface MqttProximityUpdate {
    /**
     * 
     * @type {number}
     * @memberof MqttProximityUpdate
     */
    readonly strength: number;
    /**
     * Id of exhibition this visitor session belongs to
     * @type {string}
     * @memberof MqttProximityUpdate
     */
    readonly tag: string;
}

export function MqttProximityUpdateFromJSON(json: any): MqttProximityUpdate {
    return MqttProximityUpdateFromJSONTyped(json, false);
}

export function MqttProximityUpdateFromJSONTyped(json: any, ignoreDiscriminator: boolean): MqttProximityUpdate {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'strength': json['strength'],
        'tag': json['tag'],
    };
}

export function MqttProximityUpdateToJSON(value?: MqttProximityUpdate | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
    };
}


