import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FormulaHelp({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guia de Fórmulas Disponíveis</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="or" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="or">Fórmulas OR</TabsTrigger>
            <TabsTrigger value="math">Matemáticas</TabsTrigger>
            <TabsTrigger value="conditional">Condicionais</TabsTrigger>
            <TabsTrigger value="temporal">Temporais</TabsTrigger>
            <TabsTrigger value="basic">Básicas</TabsTrigger>
          </TabsList>

          <TabsContent value="or" className="space-y-4">
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">🎯 Fórmulas OR - Alternativas com Prioridade</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                Use o operador <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">OR</code> para definir múltiplas sub-fórmulas alternativas. 
                O sistema avalia da esquerda para direita e usa a primeira que tiver todas as variáveis disponíveis.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Sintaxe Básica</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Separe sub-fórmulas com <code className="bg-muted px-1 rounded">OR</code> (máximo 5 alternativas)
              </p>
              <code className="block bg-muted p-2 rounded text-sm mb-2">
                [1.1] * 1.2 OR [1.2] * 0.9 OR 50000
              </code>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Cenário 1:</strong> Se [1.1] existe → usa primeira: [1.1] * 1.2</p>
                <p><strong>Cenário 2:</strong> Se [1.1] não existe mas [1.2] existe → usa segunda: [1.2] * 0.9</p>
                <p><strong>Cenário 3:</strong> Se nenhuma existe → usa terceira: 50000</p>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Cascata com Prioridade</h3>
              <p className="text-sm text-muted-foreground mb-2">
                As sub-fórmulas são testadas em ordem. A primeira válida é executada.
              </p>
              <code className="block bg-muted p-2 rounded text-sm mb-2">
                [vendas_online] * 1.15 OR [vendas_loja] * 1.05 OR PREV_YEAR([total]) OR 100000
              </code>
              <div className="text-xs text-muted-foreground">
                <p className="mb-1"><strong>Ordem de prioridade:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Tenta vendas online com 15% de margem</li>
                  <li>Se não disponível, tenta vendas loja com 5%</li>
                  <li>Se não disponível, usa valor do ano anterior</li>
                  <li>Como último recurso, usa valor fixo de 100000</li>
                </ol>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">⚡ Sistema de Cache</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Para melhor performance, o sistema memoriza qual sub-fórmula funcionou.
              </p>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="bg-muted p-2 rounded">
                  <p className="font-semibold mb-1">1ª Execução (cascata completa):</p>
                  <p>• Testa [1.1] → falha (variável não existe)</p>
                  <p>• Testa [1.2] → sucesso! ✓</p>
                  <p>• Guarda em cache: usar sub-fórmula #2</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="font-semibold mb-1">2ª Execução em diante (rápido):</p>
                  <p>• Vai direto para sub-fórmula #2 ⚡</p>
                  <p>• Se falhar, volta para cascata</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Fórmulas Complexas com OR</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold mb-1">Projeção com múltiplas fontes:</p>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    IF([1.1] &gt; 1000, [1.1] * 1.1, [1.1]) OR [1.2] * 0.9 OR PREV_YEAR([1.0]) * 1.05
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Tenta projeção condicional, depois alternativa, depois ano anterior com crescimento
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1">Média com fallback:</p>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    AVG([2.1], [2.2], [2.3]) OR SUM([2.1], [2.2]) / 2 OR [2.1] OR 5000
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Tenta média de 3, depois de 2, depois só uma variável, depois valor fixo
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1">Máximo com alternativas temporais:</p>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    MAX([3.1], [3.2]) OR PREV_MONTH([3.0]) OR YTD([3.0]) / 3
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Tenta máximo atual, depois mês anterior, depois média YTD
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-orange-600 dark:text-orange-400">⚠️</span>
                Limites e Validações
              </h3>
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  <strong>Máximo de sub-fórmulas:</strong> 5 alternativas
                </p>
                <p className="text-muted-foreground">
                  <strong>Referências circulares:</strong> Detectadas automaticamente ao guardar
                </p>
                <p className="text-muted-foreground">
                  <strong>Validação:</strong> Sistema valida sintaxe antes de guardar
                </p>
                <code className="block bg-red-50 dark:bg-red-950/20 p-2 rounded text-xs mt-2">
                  ❌ ERRO: A = B * 2 OR 100<br />
                  ❌ ERRO: B = A * 3 OR 50<br />
                  → Referência circular detectada!
                </code>
              </div>
            </Card>

            <Card className="p-4 bg-green-50 dark:bg-green-950/20">
              <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">💡 Dicas de Uso</h3>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
                <li>Coloque as fórmulas mais específicas primeiro</li>
                <li>Use valores fixos como última alternativa</li>
                <li>Combine com funções temporais (PREV_MONTH, PREV_YEAR)</li>
                <li>O cache é limpo ao trocar de versão</li>
                <li>Sub-fórmulas podem conter qualquer função válida</li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="math" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">SUM - Soma</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Calcula a soma de múltiplos valores.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                SUM([1.1], [1.2], [1.3])
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: SUM([1.1], [1.2]) = 150 se [1.1]=100 e [1.2]=50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">AVG - Média</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Calcula a média aritmética de múltiplos valores.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                AVG([2.1], [2.2], [2.3])
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: AVG([2.1], [2.2]) = 75 se [2.1]=100 e [2.2]=50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">MAX - Máximo</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o maior valor entre os argumentos.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                MAX([3.1], [3.2], 1000)
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: MAX([3.1], [3.2]) = 100 se [3.1]=100 e [3.2]=50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">MIN - Mínimo</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o menor valor entre os argumentos.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                MIN([4.1], [4.2], 500)
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: MIN([4.1], [4.2]) = 50 se [4.1]=100 e [4.2]=50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">ROUND - Arredondamento</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Arredonda um valor para o número de casas decimais especificado.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                ROUND([5.1] * 0.15, 2)
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: ROUND(123.456, 2) = 123.46
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">ABS - Valor Absoluto</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o valor absoluto (sempre positivo).
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                ABS([6.1] - [6.2])
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: ABS(-50) = 50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">SQRT - Raiz Quadrada</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Calcula a raiz quadrada de um valor.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                SQRT([7.1])
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: SQRT(144) = 12
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">POW - Potência</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Eleva um valor a uma potência.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                POW([8.1], 2)
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: POW(5, 2) = 25
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="conditional" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">IF - Condicional</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna um valor se a condição for verdadeira, outro se for falsa.
              </p>
              <code className="block bg-muted p-2 rounded text-sm mb-2">
                IF([1.1] &gt; 1000, [2.1] * 1.1, [2.1])
              </code>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Operadores: &gt;, &lt;, &gt;=, &lt;=, ==, !=</p>
                <p>• Exemplo: IF([1.1] &gt; 100, 50, 25) = 50 se [1.1]=150</p>
                <p>• Exemplo: IF([2.1] == 0, 100, [2.1]) = 100 se [2.1]=0</p>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Combinando Condições</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Pode combinar múltiplas condições com operadores lógicos.
              </p>
              <code className="block bg-muted p-2 rounded text-sm mb-2">
                IF([1.1] &gt; 100 &amp;&amp; [1.2] &lt; 50, [2.1], [2.2])
              </code>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• &amp;&amp; (E lógico): ambas condições devem ser verdadeiras</p>
                <p>• || (OU lógico): pelo menos uma condição deve ser verdadeira</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">PREV_MONTH - Mês Anterior</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o valor da conta no mês anterior.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                PREV_MONTH([1.1]) * 1.05
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: Crescimento de 5% em relação ao mês anterior
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">PREV_YEAR - Ano Anterior</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o valor da conta no mesmo mês do ano anterior.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                PREV_YEAR([2.1]) * 1.1
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: Crescimento de 10% em relação ao ano anterior
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">YTD - Acumulado do Ano</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Calcula o valor acumulado desde janeiro até o mês atual.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                YTD([3.1]) / [4.1]
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: Percentagem acumulada do ano sobre total
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Operadores Básicos</h3>
              <div className="space-y-3">
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    [1.1] + [1.2]
                  </code>
                  <p className="text-xs text-muted-foreground">Adição</p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    [2.1] - [2.2]
                  </code>
                  <p className="text-xs text-muted-foreground">Subtração</p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    [3.1] * [3.2]
                  </code>
                  <p className="text-xs text-muted-foreground">Multiplicação</p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    [4.1] / [4.2]
                  </code>
                  <p className="text-xs text-muted-foreground">Divisão</p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    ([5.1] + [5.2]) * 0.15
                  </code>
                  <p className="text-xs text-muted-foreground">Use parênteses para controlar a ordem</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Referências a Contas</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Use colchetes para referenciar outras contas pelo código.
              </p>
              <code className="block bg-muted p-2 rounded text-sm mb-2">
                [1.1.2] + [1.1.3]
              </code>
              <p className="text-xs text-muted-foreground">
                As referências são substituídas pelos valores reais durante o cálculo.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Exemplos Complexos</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    IF([1.1] &gt; PREV_MONTH([1.1]), [1.1] * 1.1, [1.1])
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Aumenta 10% se cresceu em relação ao mês anterior
                  </p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    ROUND(AVG([2.1], [2.2], [2.3]) * 0.85, 2)
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Média de 3 contas com desconto de 15%, arredondada
                  </p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    MAX(YTD([3.1]) / 12, PREV_YEAR([3.1]))
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Maior entre média mensal do ano e valor do ano anterior
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
