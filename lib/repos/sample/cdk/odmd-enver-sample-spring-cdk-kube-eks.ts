import {
    OdmdCrossRefConsumer,
    OdmdEnverCdk, OdmdEnverCtnImg,
    OdmdRdsCluster,
    OdmdVpc, SRC_Rev_REF,
    WithRds
} from "@ondemandenv/contracts-lib-base";
import {OdmdBuildSampleSpringCdk} from "./odmd-build-sample-spring-cdk";


/**
 * so that the cdk code to use EksManifest which takes KubeCtlThruVpc as param
 */
export class OdmdEnverSampleSpringCdkKubeEks extends OdmdEnverCdk implements WithRds {


    vpcConfig: OdmdVpc
    rdsConfig: OdmdRdsCluster

    readonly appImg: OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkKubeEks, OdmdEnverCtnImg>
    readonly migrateImg: OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkKubeEks, OdmdEnverCtnImg>

    constructor(owner: OdmdBuildSampleSpringCdk) {
        super(owner, owner.contracts.accounts.workspace0, "us-west-1", new SRC_Rev_REF("b", "p0dmdSbxUsw1"))

        const vpcRds = owner.contracts.defaultVpcRds!.getOrCreateOne(this, {
            ipamEnver: owner.contracts.networking!.ipam_west1_le,
            vpcName: 'springcdkecs'
        })
        this.vpcConfig = vpcRds.vpcConfig
        this.rdsConfig = vpcRds.getOrCreateRdsCluster('sample')

        this.migrateImg = new OdmdCrossRefConsumer(this, 'migImage', owner.contracts.springRdsImg.enverImg.migImgRefProducer);
        this.appImg = new OdmdCrossRefConsumer(this, 'appContainer', owner.contracts.springRdsImg.enverImg.appImgRefProducer);

    }

}
