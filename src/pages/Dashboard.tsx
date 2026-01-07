import { Users, Truck, Package, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientes } from '@/hooks/useClientes';
import { useFornecedores } from '@/hooks/useFornecedores';
import { useProdutos } from '@/hooks/useProdutos';

export default function Dashboard() {
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const { data: fornecedores, isLoading: loadingFornecedores } = useFornecedores();
  const { data: produtos, isLoading: loadingProdutos } = useProdutos();

  const totalClientes = clientes?.length ?? 0;
  const totalFornecedores = fornecedores?.length ?? 0;
  const totalProdutos = produtos?.length ?? 0;
  const valorEstoque = produtos?.reduce(
    (acc, p) => acc + (p.preco_venda * p.estoque_atual),
    0
  ) ?? 0;

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu negócio"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Clientes"
          value={loadingClientes ? '...' : totalClientes}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Fornecedores"
          value={loadingFornecedores ? '...' : totalFornecedores}
          icon={Truck}
        />
        <StatCard
          title="Produtos"
          value={loadingProdutos ? '...' : totalProdutos}
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Valor em Estoque"
          value={loadingProdutos ? '...' : `R$ ${valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Últimos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingClientes ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : clientes && clientes.length > 0 ? (
              <div className="space-y-4">
                {clientes.slice(0, 5).map((cliente) => (
                  <div
                    key={cliente.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">{cliente.email || 'Sem e-mail'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Produtos com Baixo Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProdutos ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : produtos && produtos.filter(p => p.estoque_atual < 10).length > 0 ? (
              <div className="space-y-4">
                {produtos
                  .filter(p => p.estoque_atual < 10)
                  .slice(0, 5)
                  .map((produto) => (
                    <div
                      key={produto.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-foreground">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground">SKU: {produto.sku}</p>
                      </div>
                      <span className={`text-sm font-medium ${produto.estoque_atual === 0 ? 'text-destructive' : 'text-warning'}`}>
                        {produto.estoque_atual} un.
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Todos os produtos estão com estoque adequado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
