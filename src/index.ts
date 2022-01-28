import * as k8s from "@pulumi/kubernetes";

const appLabels = { app: "nginx" };
const deployment = new k8s.apps.v1.Deployment("nginx", {
  spec: {
    selector: { matchLabels: appLabels },
    replicas: 1,
    template: {
      metadata: { labels: appLabels },
      spec: { containers: [{ name: "nginx", image: "nginx" }] },
    },
  },
});

const ingress = new k8s.apiextensions.CustomResource("nginx-ingress", {
  apiVersion: "projectcontour.io/v1",
  kind: "HTTPProxy",
  spec: {
    virtualHost: {
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
            name: "nginx",
            port: 80,
          },
        ],
      },
    ],
  },
});
