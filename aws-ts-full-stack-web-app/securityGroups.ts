/*
 * Copyright (c) 2018 Pulumi Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import * as aws from "@pulumi/aws";
import * as awsInfra from "@pulumi/aws-infra";

// TerraformEgressNote:
// A newly-created VPC security group includes a default rule to allow all
// egress traffic. Terraform explicitly removes this rule, so we have to
// add it back.

// TODO: ^---- Should this be documented somewhere in the Pulumi FAQ?

// defaultVpc is the default VPC for the current AWS account.
const defaultVpc = awsInfra.Network.getDefault();

const ALL = {
    fromPort: 0,
    toPort: 0,
    protocol: "-1",  // all
    cidrBlocks: [ "0.0.0.0/0" ],
};

const sshPort = 22;
const httpPort = 80;
const httpsPort = 443;

function oneTcpPortFromAnywhere(port: number) {
    return {
        fromPort: port,
        toPort: port,
        protocol: "TCP",
        cidrBlocks: [ "0.0.0.0/0" ],
    };
}

// loadBalancerSecurityGroup is the security group for the Load Balancer.
export const loadBalancerSecurityGroup = new aws.ec2.SecurityGroup(
    "loadBalancerSecurityGroup", {
    vpcId: defaultVpc.vpcId,
    ingress: [
        oneTcpPortFromAnywhere(httpPort),
        oneTcpPortFromAnywhere(httpsPort),
    ],
    egress: [ ALL ],  // See TerraformEgressNote
});

// vmSecurityGroup is the security group for various EC2 instances.
export const  vmSecurityGroup = new aws.ec2.SecurityGroup(
    "vmSecurityGroup", { 
    vpcId: defaultVpc.vpcId,
    ingress: [
        oneTcpPortFromAnywhere(sshPort),
        oneTcpPortFromAnywhere(httpPort),
        oneTcpPortFromAnywhere(httpsPort),
    ],
});

// TODO: Add databaseSecurityGroup when RDS is hooked up.