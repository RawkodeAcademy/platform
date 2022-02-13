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
      tls: {
        secretName: "nginx-tls",
      },
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

const certificate = new k8s.apiextensions.CustomResource("nginx-tls", {
  apiVersion: "cert-manager.io/v1",
  kind: "Certificate",
  spec: {
    commonName: "nginx.rawkode.sh",
    dnsNames: ["nginx.rawkode.sh"],
    issuerRef: {
      name: "letsencrypt-production",
      kind: "ClusterIssuer",
    },
    secretName: "nginx-tls",
  },
});
