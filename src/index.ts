import * as k8s from "@pulumi/kubernetes";
import * as k8x from "@pulumi/kubernetesx";

const port = 80;
const appLabels = { app: "nginx" };

const app = new k8x.Deployment("nginx", {
  spec: {
    selector: { matchLabels: appLabels },
    replicas: 1,
    template: {
      metadata: { labels: appLabels },
      spec: { containers: [{ name: "nginx", image: "nginx" }] },
    },
  },
});

const service = app.createService({
  type: "ClusterIP",
  ports: [{ port }],
});

const ingress = new k8s.apiextensions.CustomResource("nginx-ingress", {
  apiVersion: "projectcontour.io/v1",
  kind: "HTTPProxy",
  spec: {
    virtualhost: {
      fqdn: "nginx.rawkode.sh",
    },
    routes: [
      {
        conditions: [
          {
            prefix: "/",
          },
        ],
        services: [
          {
            name: service.metadata.name,
            port: port,
          },
        ],
      },
    ],
  },
});
