import { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useProdutos, useCreateProduto, useUpdateProduto, useDeleteProduto } from '@/hooks/useProdutos';
import { useFornecedores } from '@/hooks/useFornecedores';

interface ProdutoWithFornecedor {
  id: string;
  nome: string;
  sku: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  fornecedor_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  fornecedor: { id: string; razao_social: string } | null;
}

export default function Produtos() {
  const { toast } = useToast();
  const { data: produtos, isLoading } = useProdutos();
  const { data: fornecedores } = useFornecedores();
  const createProduto = useCreateProduto();
  const updateProduto = useUpdateProduto();
  const deleteProduto = useDeleteProduto();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoWithFornecedor | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    sku: '',
    preco_custo: '',
    preco_venda: '',
    estoque_atual: '',
    fornecedor_id: '',
  });

  const filteredProdutos = (produtos as ProdutoWithFornecedor[] | undefined)?.filter((produto) =>
    produto.nome.toLowerCase().includes(search.toLowerCase()) ||
    produto.sku.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      nome: '',
      sku: '',
      preco_custo: '',
      preco_venda: '',
      estoque_atual: '',
      fornecedor_id: '',
    });
    setEditingProduto(null);
  };

  const openDialog = (produto?: ProdutoWithFornecedor) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        nome: produto.nome,
        sku: produto.sku,
        preco_custo: produto.preco_custo.toString(),
        preco_venda: produto.preco_venda.toString(),
        estoque_atual: produto.estoque_atual.toString(),
        fornecedor_id: produto.fornecedor_id || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nome: formData.nome,
      sku: formData.sku,
      preco_custo: parseFloat(formData.preco_custo) || 0,
      preco_venda: parseFloat(formData.preco_venda) || 0,
      estoque_atual: parseInt(formData.estoque_atual) || 0,
      fornecedor_id: formData.fornecedor_id || null,
    };

    try {
      if (editingProduto) {
        await updateProduto.mutateAsync({ id: editingProduto.id, ...payload });
        toast({ title: 'Produto atualizado com sucesso!' });
      } else {
        await createProduto.mutateAsync(payload);
        toast({ title: 'Produto criado com sucesso!' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Erro ao salvar produto',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await deleteProduto.mutateAsync(id);
      toast({ title: 'Produto excluído com sucesso!' });
    } catch (error) {
      toast({
        title: 'Erro ao excluir produto',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Produtos"
        description="Gerencie seu catálogo de produtos"
        actions={
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        }
      />

      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : filteredProdutos && filteredProdutos.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Preço Custo</TableHead>
                    <TableHead>Preço Venda</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell className="font-mono text-sm">{produto.sku}</TableCell>
                      <TableCell>{formatCurrency(produto.preco_custo)}</TableCell>
                      <TableCell>{formatCurrency(produto.preco_venda)}</TableCell>
                      <TableCell>
                        <span className={produto.estoque_atual < 10 ? 'text-warning font-medium' : ''}>
                          {produto.estoque_atual}
                        </span>
                      </TableCell>
                      <TableCell>{produto.fornecedor?.razao_social || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(produto)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(produto.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum produto encontrado
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_custo">Preço de Custo</Label>
                <Input
                  id="preco_custo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_custo}
                  onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_venda">Preço de Venda</Label>
                <Input
                  id="preco_venda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_venda}
                  onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque_atual">Estoque Atual</Label>
                <Input
                  id="estoque_atual"
                  type="number"
                  min="0"
                  value={formData.estoque_atual}
                  onChange={(e) => setFormData({ ...formData, estoque_atual: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fornecedor_id">Fornecedor</Label>
                <Select
                  value={formData.fornecedor_id}
                  onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores?.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createProduto.isPending || updateProduto.isPending}>
                {editingProduto ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
