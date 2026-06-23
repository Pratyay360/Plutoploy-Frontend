import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Header } from '../components/Layout/Header';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DeploymentTable } from '../components/ui/DeploymentTable';
import { TerminalLogViewer } from '../components/ui/TerminalLogViewer';
import { EnvVariablesEditor } from '../components/ui/EnvVariablesEditor';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Rocket, 
  GitBranch, 
  ExternalLink, 
  RefreshCw,
  Globe,
  Clock,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import api from '../lib/api';

interface LogLine {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const envVariables = [
  { id: '1', key: 'DATABASE_URL', value: 'postgresql://...', isSecret: true },
  { id: '2', key: 'NEXT_PUBLIC_API_URL', value: 'https://api.example.com', isSecret: false },
  { id: '3', key: 'JWT_SECRET', value: 'super-secret-key', isSecret: true },
];

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const repoFullName = location.state?.repoFullName || 'unknown/repo';
  
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [status, setStatus] = useState<'building' | 'success' | 'failed'>('building');
  
  const [deployments, setDeployments] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  useEffect(() => {
    // 1. Set up SSE connection
    if (!id) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('auth_token') || '';
    // Use query parameter for token since EventSource doesn't support custom headers and cross-origin cookies may be blocked
    const eventSource = new EventSource(`${API_URL}/builds/${id}/logs?token=${token}`, { withCredentials: true });

    eventSource.onmessage = (event) => {
      const data = event.data;
      
      if (data === '--- BUILD SUCCESS ---' || data === '--- BUILD FAILED ---') {
        setIsStreaming(false);
        const finalStatus = data === '--- BUILD SUCCESS ---' ? 'success' : 'failed';
        setStatus(finalStatus);
        eventSource.close();
        
        if (finalStatus === 'success') {
          // Wait briefly for the backend's automated webhook deployment to settle in DB
          setTimeout(() => {
            api.deploy.list().then(deployData => {
              setDeployments(deployData || []);
              const myDeploys = deployData?.filter((d: any) => d.repo === repoFullName) || [];
              if (myDeploys.length > 0) {
                setLiveUrl(`https://${myDeploys[myDeploys.length - 1].subdomain}.deployhub.dev`);
                setActiveTab('deployments'); // Switch to deployments tab automatically
              }
            }).catch(console.error);
          }, 3000);
        }
        return;
      }

      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: data,
        type: data.toLowerCase().includes('error') ? 'error' : 'info'
      }]);
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
      setIsStreaming(false);
      setStatus('failed');
    };

    return () => {
      eventSource.close();
    };
  }, [id, repoFullName]);

  // Fetch deployments to show in the table
  useEffect(() => {
    api.deploy.list().then(data => {
      setDeployments(data || []);
      // If we have deployments, maybe find the live url
      const myDeploys = data?.filter((d: any) => d.repo === repoFullName) || [];
      if (myDeploys.length > 0) {
        setLiveUrl(`https://${myDeploys[myDeploys.length - 1].subdomain}.deployhub.dev`);
      }
    }).catch(console.error);
  }, [repoFullName]);

  const handleAutoDeploy = async (repo: string) => {
    setIsDeploying(true);
    try {
      const randomStr = Math.random().toString(36).substring(2, 6);
      const safeName = repo.split('/').pop()?.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'app';
      const subdomain = `${safeName}-${randomStr}`;
      
      const res = await api.deploy.create({
        image: `ghcr.io/${repo.toLowerCase()}:latest`,
        subdomain,
        repo
      });
      
      if (res && res.deployment) {
        setDeployments(prev => [res.deployment, ...prev]);
        setLiveUrl(`https://${res.deployment.subdomain}.deployhub.dev`);
        setActiveTab('deployments'); // switch to deployments tab
      }
    } catch (err) {
      console.error('Failed to auto-deploy', err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleManualDeploy = () => {
    if (repoFullName !== 'unknown/repo') {
      handleAutoDeploy(repoFullName);
    } else {
      alert("Repository name is missing. Please initiate a new project.");
    }
  };

  return (
    <DashboardLayout>
      <Header title={repoFullName.split('/').pop() || 'Project Details'} />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Project Header Card */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#06f8d8]/10">
                <Globe className="w-6 h-6 text-[#06f8d8]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold text-foreground">
                    {repoFullName.split('/').pop() || 'Loading...'}
                  </h2>
                  <StatusBadge status={status} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4" />
                    {repoFullName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Just now
                  </span>
                  {liveUrl && (
                    <a 
                      href={liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {liveUrl.replace('https://', '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className='"border-white/10 text-white hover:border-[#06f8d8]/50 hover:bg-[#06f8d8] hover:text-black p-5 mt-4'
                onClick={handleManualDeploy} disabled={isDeploying || status === 'building'}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Redeploy
              </Button>
              <Button 
                onClick={handleManualDeploy}
                disabled={isDeploying || status === 'building'}
                className="flex-1 w-full mt-4 p-5 bg-[#06f8d8] text-background hover:bg-[#06f8d8]/80 font-medium cursor-pointer"
              >
                {isDeploying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                {isDeploying ? 'Deploying...' : 'Deploy Now'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#242c6f] border border-border">
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-6">
            <TerminalLogViewer logs={logs} status={status} isStreaming={isStreaming} />
          </TabsContent>

          <TabsContent value="deployments" className="mt-6">
            <DeploymentTable deployments={deployments} showProject={false} />
          </TabsContent>

          <TabsContent value="environment" className="mt-6">
            <EnvVariablesEditor variables={envVariables} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="glass-card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Project Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Production Branch</p>
                    <p className="text-sm text-muted-foreground">Branch used for production deployments</p>
                  </div>
                  <span className="px-3 py-1 bg-secondary rounded-md font-mono text-sm">
                    main
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-destructive/20">
                  <div>
                    <p className="font-medium text-destructive">Delete Project</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this project and all deployments
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
