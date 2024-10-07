import {
    AnyOdmdEnVer,
    BorrowVpcRds, OdmdCrossRefConsumer,
    OdmdEnverCdk,
    OdmdEnverCdkDefaultVpc, OdmdRdsCluster,
    OdmdVpc, PgSchemaUsersProps, PgUsr, SRC_Rev_REF,
    WithRds
} from "@ondemandenv/contracts-lib-base";
import {OdmdBuildSampleSpringCdk} from "./odmd-build-sample-spring-cdk";


export class OdmdEnverSampleSpringCdkEcs extends OdmdEnverCdk implements BorrowVpcRds, WithRds {


    readonly vpcRdsProvidingEnver: OdmdEnverCdkDefaultVpc;

    readonly vpcConfig: OdmdVpc
    readonly rdsConfig: OdmdRdsCluster

    public readonly pgSchemaUsersProps: PgSchemaUsersProps
    public readonly readOnlyPub: PgUsr


    readonly imgSrcEnver

    readonly rdsPort: OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyOdmdEnVer>
    readonly rdsHost: OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyOdmdEnVer>
    readonly rdsSocketAddress: OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyOdmdEnVer>
    readonly rdsUsrReadOnly: OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyOdmdEnVer>

    readonly migImgName: OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyOdmdEnVer>
    readonly appImgName: OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyOdmdEnVer>

    constructor(owner: OdmdBuildSampleSpringCdk) {
        super(owner, owner.contracts.accounts.workspace1, "us-west-1", new SRC_Rev_REF("b", "odmdSbxUsw1"));


        this.readOnlyPub = {
            roleType: 'readonly',
            userName: 'cdkecs_readonly1'
        };

        this.vpcRdsProvidingEnver = owner.contracts.defaultVpcRds!.getOrCreateOne(this, {
            ipamEnver: owner.contracts.networking!.ipam_west1_le,
            vpcName: 'springcdkecs'
        })

        this.vpcConfig = this.vpcRdsProvidingEnver.vpcConfig
        this.rdsConfig = this.vpcRdsProvidingEnver.getOrCreateRdsCluster('sample')


        this.pgSchemaUsersProps = new PgSchemaUsersProps(this, 'cdkecs', [this.readOnlyPub]);
        this.vpcRdsProvidingEnver.addSchemaUsers(this.rdsConfig, this.pgSchemaUsersProps)

        this.rdsPort = new OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsPort', this.rdsConfig.clusterPort)
        this.rdsHost = new OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsHost', this.rdsConfig.clusterHostname)
        this.rdsSocketAddress = new OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsSocketAddress', this.rdsConfig.clusterSocketAddress)
        this.rdsUsrReadOnly = new OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsUsrReadOnly', this.rdsConfig.usernameToSecretId.get(this.readOnlyPub.userName)!)

        this.preCdkCmds.push('npm run build')
        this.imgSrcEnver = owner.contracts.springRdsImg.enverImg;

        this.migImgName = new OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'migImgName', this.imgSrcEnver.migImgRefProducer)
        this.appImgName = new OdmdCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'appImgName', this.imgSrcEnver.appImgRefProducer)

        const imgToRepoProducers = this.imgSrcEnver.builtImgNameToRepoProducer;

        for (const imgName in imgToRepoProducers) {
            new OdmdCrossRefConsumer(this, imgName, imgToRepoProducers[imgName])
        }
    }

}
