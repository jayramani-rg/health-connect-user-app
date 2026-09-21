import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '../../../components/Avatar/Avatar';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DateField } from '../../../components/DateField/DateField';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { Icon } from '../../../components/Icon/Icon';
import { TextField } from '../../../components/TextField/TextField';
import { colors, spacing } from '../../../theme';
import { dependentService } from '../../../services/dependentService';
import type { Dependent, SaveDependentRequest } from '../../patients/types/patient.types';
import { styles } from '../styles/FamilyMembersScreen.styles';

const EMPTY_FORM: SaveDependentRequest = { firstName: '', lastName: '', relation: '', dob: undefined, gender: undefined };
const MAX_DOB = new Date();
const MIN_DOB = new Date(MAX_DOB.getFullYear() - 120, MAX_DOB.getMonth(), MAX_DOB.getDate());

const FamilyMembersScreen: React.FC = () => {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SaveDependentRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await dependentService.listMine();
      setDependents(response.data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not load family members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(dependent: Dependent) {
    setEditingId(dependent.id);
    setForm({
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      relation: dependent.relation,
      dob: dependent.dob ?? undefined,
      gender: dependent.gender ?? undefined,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.relation.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await dependentService.update(editingId, form);
      } else {
        await dependentService.create(form);
      }
      setShowForm(false);
      await load();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not save this family member.');
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(dependent: Dependent) {
    Alert.alert('Remove family member', `Remove ${dependent.firstName} ${dependent.lastName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await dependentService.remove(dependent.id);
            await load();
          } catch (error) {
            setErrorText(error instanceof Error ? error.message : 'Could not remove this family member.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={dependents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {errorText && <Banner variant="error" message={errorText} />}
            {showForm && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>{editingId ? 'Edit family member' : 'Add family member'}</Text>
                <TextField label="First name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} autoCapitalize="words" />
                <TextField label="Last name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} autoCapitalize="words" />
                <TextField
                  label="Relation"
                  value={form.relation}
                  onChangeText={(v) => setForm({ ...form, relation: v })}
                  placeholder="e.g. Mother, Son, Spouse"
                />
                <DateField
                  label="Date of birth (optional)"
                  value={form.dob ?? ''}
                  onChange={(v) => setForm({ ...form, dob: v || undefined })}
                  maximumDate={MAX_DOB}
                  minimumDate={MIN_DOB}
                />
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Button label="Cancel" variant="secondary" onPress={() => setShowForm(false)} disabled={saving} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Save" loading={saving} onPress={handleSave} />
                  </View>
                </View>
              </View>
            )}
            {!showForm && <Button label="Add family member" onPress={openCreate} style={{ marginBottom: spacing.md }} />}
          </>
        }
        ListEmptyComponent={
          showForm ? undefined : <EmptyState title="No family members yet" description="Add a family member to book appointments or lab tests on their behalf." />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Avatar name={`${item.firstName} ${item.lastName}`} size={44} />
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.cardMeta}>{item.relation}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEdit(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="create-outline" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmRemove(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default FamilyMembersScreen;
