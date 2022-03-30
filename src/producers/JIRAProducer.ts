import Producer from '@producers/Producer';

export default class implements Producer {
  async produce(data: any): Promise<void> {
    // data.sprints.forEach((item: any) => {
    //   console.log(`
    //   curl -X "POST" "https://motorway.atlassian.net/rest/agile/1.0/sprint" \
    //     -H 'Content-Type: application/json' \
    //     -H 'Authorization: Basic ${process.env.PRODUCER_TOKEN}' \
    //     -d '${JSON.stringify(item)}'`);
    // });

    // console.log('...then use bulk upload and upload this in a JSON file.');
    // console.log('https://motorway.atlassian.net/secure/admin/ImporterFinishedPage%21default.jspa?externalSystem=com.atlassian.jira.plugins.jim-plugin%3AjsonImporter&atl_token=e1f312ef-a95a-4a9a-9a28-d0b569cd91be_f2a7094cb9787e80194a55dad6a850095240dcb5_lin');
    // // eslint-disable-next-line no-param-reassign
    // delete data.sprints;
    console.log(JSON.stringify(data, undefined, 2));
  }
}
